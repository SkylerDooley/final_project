import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function USFarmMap() {
  const ref = useRef();

  const [selectedYear, setSelectedYear] = useState(2020); // open on 2020
  const [data, setData] = useState([]);

  // Load CSV
  useEffect(() => {
    d3.csv("/state_farm_counts.csv", d => ({
      state: d.state,
      year: +d.year,
      num_farms: +d.num_farms
    })).then(csvData => {
      setData(csvData);
    });
  }, []);

  // Draw map when year changes (button press)
  useEffect(() => {
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

    // Current year data
    const yearData = data.filter(d => d.year === selectedYear);
    const dataMap = new Map(yearData.map(d => [d.state, d.num_farms]));

    // Previous year data (if exists)
    const prevYear = selectedYear - 1;
    const prevData = data.filter(d => d.year === prevYear);
    const prevMap = new Map(prevData.map(d => [d.state, d.num_farms]));

    // Original categorical colors for 2020
    const baseColors = d3.schemeTableau10;
    const colorArray = Array.from({ length: 50 }, (_, i) => baseColors[i % baseColors.length]);
    const originalColor = d3.scaleOrdinal().range(colorArray);

    // Year-over-year color logic
    function getColor(state) {
      const current = dataMap.get(state);

      // If 2020 → use original categorical colors
      if (selectedYear === 2020) {
        return originalColor(state);
      }

      const previous = prevMap.get(state);

      if (current == null || previous == null) return "#ccc";
      // color palette taken from 2020 color palette (Tableau color palette)
      if (current > previous) return "#59a14f"; 
      if (current < previous) return "#e15759";
      return "#f2d55c";
    }



    // Tooltip
    const tooltip = d3.select("body").selectAll(".map-tooltip").data([null]);
    const tooltipEnter = tooltip.enter()
      .append("div")
      .attr("class", "map-tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "6px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("visibility", "hidden");

    const tip = tooltipEnter.merge(tooltip);

    // Load DOI GeoJSON
    d3.json("/states.json").then(rawGeo => {

      const allowed = new Set([
        "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
        "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
        "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
        "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
        "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
        "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
        "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
        "Wisconsin","Wyoming"
      ]);

      const features = rawGeo.features
        .filter(f => allowed.has(f.properties.NAME))
        .map(f => ({
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
        .on("mouseover", function (event, d) {
          const current = dataMap.get(d.properties.name);
          const previous = prevMap.get(d.properties.name);

          tip.style("visibility", "visible")
            .html(`
              <strong>${d.properties.name}</strong><br/>
              Year: ${selectedYear}<br/>
              Number of Farms: ${current ? current.toLocaleString() : "N/A"}<br/>
              Change vs ${prevYear}: ${
                previous == null ? "N/A"
                : current > previous ? "▲ Increase"
                : current < previous ? "▼ Decrease"
                : "— No change"
              }
            `);
        })
        .on("mousemove", function (event) {
          tip.style("top", (event.pageY - 10) + "px")
             .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
          tip.style("visibility", "hidden");
        });
    });

  }, [selectedYear, data]);

  return (
  <div style={{ display: "flex" }}>

    {/* Map */}
    <div ref={ref}></div>

    {/* Right-side controls */}
    <div style={{ marginLeft: "20px" }}>
      <h4>Select Year</h4>

      {[2020, 2021, 2022, 2023, 2024, 2025].map(y => (
        <button
          key={y}
          onClick={() => setSelectedYear(y)}
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "8px 12px",
            background: selectedYear === y ? "#1976d2" : "#eee",
            color: selectedYear === y ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            width: "100px",
            textAlign: "center"
          }}
        >
          {y}
        </button>
      ))}

      {/* Legend */}
      <div style={{ marginTop: "30px" }}>
        <h4 style={{ margin: "0 0 4px 0" }}>Legend</h4>
        <h5 style={{ margin: "0 0 6px 0" }}>(Number of Farms)</h5>


        <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
          <div style={{
            width: "18px",
            height: "18px",
            background: "#59a14f",
            border: "1px solid #333",
            marginRight: "8px"
          }}></div>
          <span>Increase</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
          <div style={{
            width: "18px",
            height: "18px",
            background: "#f2d55c",
            border: "1px solid #333",
            marginRight: "8px"
          }}></div>
          <span>No change</span>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            width: "18px",
            height: "18px",
            background: "#e15759",
            border: "1px solid #333",
            marginRight: "8px"
          }}></div>
          <span>Decrease</span>
        </div>
      </div>
    </div>
  </div>
);

}
