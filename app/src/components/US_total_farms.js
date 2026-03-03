import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function FarmTotalsLineChart() {
  const ref = useRef();

  const [mode, setMode] = useState("farms");
  const [farmTotals, setFarmTotals] = useState([]);
  const [landTotals, setLandTotals] = useState([]);

  // -------- LOAD DATA --------
  useEffect(() => {

    // Farms totals
    d3.csv("/year_totals.csv", d => ({
      year: +d.year,
      total: +d.total_farms
    })).then(setFarmTotals);

    // Land needs aggregation
    d3.csv("/land_in_farms.csv", d => ({
      year: +d.year,
      land: +d.land_in_farms
    })).then(data => {

      const grouped = d3.rollups(
        data,
        v => d3.sum(v, d => d.land),
        d => d.year
      );

      const totals = grouped.map(([year, total]) => ({
        year: +year,
        total: total
      }));

      setLandTotals(totals);
    });

  }, []);

  // -------- DRAW CHART --------
  useEffect(() => {

    const data = mode === "farms" ? farmTotals : landTotals;
    if (!data.length) return;

    const sorted = [...data].sort((a, b) => a.year - b.year);

    const width = 700;
    const height = 350;
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    //x scale
    const x = d3.scaleLinear()
      .domain(d3.extent(sorted, d => d.year))
      .range([margin.left, width - margin.right]);

    //y scale
    const y = d3.scaleLinear()
    .domain(
      mode === "farms"
        ? [1850000, 2050000] //y axis for num farms  
        : d3.extent(sorted, d => d.total) // auto-fit for farmland
    )
    .nice()
    .range([height - margin.bottom, margin.top]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(",")));

    const color = mode === "farms" ? "#59a14f" : "#1976d2"; // define color to alternate when toggled
    // Line
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.total));

    svg.append("path")
      .datum(sorted)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("d", line);

    // ------------------ TOOLTIP ------------------
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "6px 10px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // ------------------ DOTS ------------------
    svg.selectAll("circle")
      .data(sorted)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.total))
      .attr("r", 4)
      .attr("fill", color)   

      // SHOW tooltip
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>Year:</strong> ${d.year}<br>
            <strong>Total:</strong> ${d3.format(",")(d.total)}
          `);
      })

      // MOVE tooltip
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY - 28) + "px");
      })

      // HIDE tooltip
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

  }, [mode, farmTotals, landTotals]);

  return (
    <div
      style={{
        display: "flex", 
        gap: 20                    
      }}
    >
      {/* Graph */}
      <div ref={ref}></div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column"}}>
        <h4>Metric</h4>
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
            boxShadow:
              mode === "farms"
                ? "0 0 0 2px rgba(25,118,210,.25)"
                : "none",
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
            boxShadow:
              mode === "land"
                ? "0 0 0 2px rgba(25,118,210,.25)"
                : "none",
            width: 140
          }}
        >
          Land in Farms
        </button>
      </div>
    </div>
  );
}