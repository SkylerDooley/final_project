import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function USFarmMap() {
  const ref = useRef();
  const barRef = useRef();


  const [selectedYear, setSelectedYear] = useState(2020);
  const [mode, setMode] = useState("farms"); // farms | land

  const [farmData, setFarmData] = useState([]);
  const [landData, setLandData] = useState([]);


  // ---------- LOAD CSVS ----------
  useEffect(() => {
    d3.csv("state_farm_counts.csv", d => ({
      state: d.state,
      year: +d.year,
      value: +d.num_farms
    })).then(setFarmData);

    d3.csv("land_in_farms.csv", d => ({
      state: d.state,
      year: +d.year,
      value: +d.land_in_farms
    })).then(setLandData);
  }, []);

  // ---------- DRAW MAP ----------
  useEffect(() => {
    const data = mode === "farms" ? farmData : landData;
    if (!data.length) return;

    const width = 960;
    const height = 600;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(1200);

    const path = d3.geoPath().projection(projection);

    // current + previous year
    const yearData = data.filter(d => d.year === selectedYear);
    const prevData = data.filter(d => d.year === selectedYear - 1);

    const dataMap = new Map(yearData.map(d => [d.state, d.value]));
    const prevMap = new Map(prevData.map(d => [d.state, d.value]));

    // color logic
    const baseColors = d3.schemeTableau10;
    const colorArray = Array.from({ length: 50 }, (_, i) => baseColors[i % baseColors.length]);
    const originalColor = d3.scaleOrdinal().range(colorArray);

    function getColor(state) {
      const current = dataMap.get(state);

      if (selectedYear === 2020) return originalColor(state);

      const previous = prevMap.get(state);
      if (current == null || previous == null) return "#ccc";

      if (current > previous) return "#59a14f";
      if (current < previous) return "#e15759";
      return "#f2d55c";
    }

    // tooltip
    const tip = d3.select("body")
      .selectAll(".map-tooltip")
      .data([null])
      .join("div")
      .attr("class", "map-tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "6px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("visibility", "hidden");

    // load geojson
    d3.json("/states.json").then(rawGeo => {

      const features = rawGeo.features.map(f => ({
        ...f,
        properties: { name: f.properties.NAME }
      }));

      svg.selectAll("path")
        .data(features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => getColor(d.properties.name))
        .attr("stroke", "#fff")
        .on("mouseover", (event, d) => {
          const val = dataMap.get(d.properties.name);
          const prev = prevMap.get(d.properties.name);

          tip.style("visibility", "visible")
            .html(`
              <strong>${d.properties.name}</strong><br/>
              Year: ${selectedYear}<br/>
              ${
                mode === "farms"
                  ? `Farms: ${val?.toLocaleString() ?? "N/A"}`
                  : `Land: ${val?.toLocaleString() ?? "N/A"} (1,000 acres)`
              }<br/>
              Change vs ${selectedYear - 1}: ${
                prev == null ? "N/A"
                : val > prev ? "Increase"
                : val < prev ? "Decrease"
                : "No change"
              }
            `);
        })
        .on("mousemove", event => {
          tip.style("top", event.pageY - 10 + "px")
             .style("left", event.pageX + 10 + "px");
        })
        .on("mouseout", () => tip.style("visibility", "hidden"));
    });


    // ---------- DRAW BAR CHART ----------
      d3.select(barRef.current).selectAll("*").remove();

      const barWidth = 960;
      const barHeight = 300;
      const margin = { top: 20, right: 20, bottom: 80, left: 60 };

      const svgBar = d3.select(barRef.current)
        .append("svg")
        .attr("width", barWidth)
        .attr("height", barHeight);

      // convert Map → array
      const barData = Array.from(dataMap, ([state, value]) => ({ state, value }))
        .sort((a, b) => d3.ascending(a.state, b.state)); // alphabetical

      // scales
      const x = d3.scaleBand()
        .domain(barData.map(d => d.state))
        .range([margin.left, barWidth - margin.right])
        .padding(0.2);

      const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.value)])
        .nice()
        .range([barHeight - margin.bottom, margin.top]);

      // axes
      svgBar.append("g")
        .attr("transform", `translate(0,${barHeight - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-65)")
        .style("text-anchor", "end")
        .style("font-size", "11px");

      svgBar.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(6));

      // bars
      svgBar.selectAll("rect")
      .data(barData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.state))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => barHeight - margin.bottom - y(d.value))
      .attr("fill", d => getColor(d.state))
      .on("mouseover", (event, d) => {
        const prev = prevMap.get(d.state);
        const val = d.value;

        tip.style("visibility", "visible")
          .html(`
            <strong>${d.state}</strong><br/>
            Year: ${selectedYear}<br/>
            ${
              mode === "farms"
                ? `Farms: ${val.toLocaleString()}`
                : `Land: ${val.toLocaleString()} (1,000 acres)`
            }<br/>
            Change vs ${selectedYear - 1}: ${
              prev == null ? "N/A"
              : val > prev ? "Increase"
              : val < prev ? "Decrease"
              : "No change"
            }
          `);
      })
      .on("mousemove", event => {
        tip.style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", () => {
        tip.style("visibility", "hidden");
      });


  }, [selectedYear, mode, farmData, landData]);



  // ---------- LEGEND ROW ----------
  const LegendRow = ({ color, label }) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
      <div style={{
        width: 18,
        height: 18,
        background: color,
        border: "1px solid #333",
        marginRight: 8
      }} />
      <span>{label}</span>
    </div>
  );

  

  // ---------- UI ----------
  return (
  <div style={{ display: "flex" }}>


    {/* MAP */}
    <div style={{ display: "flex", flexDirection: "column" }}>
    <div ref={ref}></div>   {/* map */}
    <div ref={barRef}></div>  {/* bars */}
    </div>



    {/* CONTROLS */}
    <div style={{ marginLeft: 20 }}>

      <h4 style={{ marginBottom: 8 }}>Select Year</h4>
      {[2020,2021,2022,2023,2024,2025].map(y => (
        <button
          key={y}
          onClick={() => setSelectedYear(y)}
          style={{
            display: "block",
            marginBottom: 10,
            padding: "8px 12px",
            background: selectedYear === y ? "#1976d2" : "#eee",
            color: selectedYear === y ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
            width: 140
          }}
        >
          {y}
        </button>
      ))}

      

      {/* METRIC */}
      <h4 style={{ marginBottom: 8 }}>Metric</h4>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <button
          onClick={() => setMode("farms")}
          style={{
            padding: "8px 14px",
            marginBottom: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            cursor: "pointer",
            background: mode === "farms" ? "#1976d2" : "#eee",
            color: mode === "farms" ? "white" : "black",
            boxShadow: mode === "farms" ? "0 0 0 2px rgba(25,118,210,.25)" : "none",
            width: 140
          }}
        >
          Number of Farms
        </button>

        <button
          onClick={() => setMode("land")}
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            border: "1px solid #ccc",
            cursor: "pointer",
            background: mode === "land" ? "#1976d2" : "#eee",
            color: mode === "land" ? "white" : "black",
            boxShadow: mode === "land" ? "0 0 0 2px rgba(25,118,210,.25)" : "none",
            width: 140
          }}
        >
          Land in Farms
        </button>
      </div>

      {/* LEGEND */}
      <div style={{ marginTop: 30, textAlign: "center" }}>
        <h4 style={{ margin: "0 0 4px 0" }}>Legend</h4>
        <h5 style={{ margin: "0 0 8px 0", fontWeight: 500 }}>
          ({mode === "farms" ? "Farm Count Change" : "Land Area Change"})
        </h5>
        <LegendRow color="#59a14f" label="Increase" />
        <LegendRow color="#f2d55c" label="No change" />
        <LegendRow color="#e15759" label="Decrease" />
      </div>

    
    </div>
  
  </div>
);
}

