import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function USFarmMap() {
  const ref = useRef();

  const [selectedYear, setSelectedYear] = useState(2025);
  const [data, setData] = useState([]);

  // Load CSV once
  useEffect(() => {
    d3.csv("/state_farm_counts.csv", d => ({
      state: d.state,
      year: +d.year,
      num_farms: +d.num_farms
    })).then(csvData => {
      setData(csvData);
    });
  }, []);

  // Draw map when year changes
  useEffect(() => {
    if (!data.length) return;

    const width = 960;
    const height = 600;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "white");

    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(1200);

    const path = d3.geoPath().projection(projection);

    const yearData = data.filter(d => d.year === selectedYear);
    const dataMap = new Map(yearData.map(d => [d.state, d.num_farms]));

    // Categorical color palette
    const baseColors = d3.schemeTableau10;
    const colorArray = Array.from({ length: 50 }, (_, i) => baseColors[i % baseColors.length]);
    const color = d3.scaleOrdinal().range(colorArray);

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

      // 50 official states
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

      // Normalize DOI → D3-friendly format
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
        .attr("fill", d => {
          const value = dataMap.get(d.properties.name);
          return value ? color(d.properties.name) : "#ddd";
        })
        .attr("stroke", "#fff")
        .on("mouseover", function (event, d) {
          const value = dataMap.get(d.properties.name);

          tip.style("visibility", "visible")
            .html(`
              <strong>${d.properties.name}</strong><br/>
              Year: ${selectedYear}<br/>
              Farms: ${value ? value.toLocaleString() : "N/A"}
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

      {/* Year buttons */}
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
      </div>
    </div>
  );
}
