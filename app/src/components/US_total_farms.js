import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function FarmLineChart() {
  const ref = useRef();

  useEffect(() => {
    d3.csv("/farm_master.csv").then(raw => {

      const totals = d3.rollups(
        raw.filter(d => d.metric === "num_farms"),
        v => d3.sum(v, d => +d.value),
        d => +d.year
      )
      .map(([year, total]) => ({ year, total }))
      .sort((a,b) => a.year - b.year)
      .slice(-5);

      drawChart(totals);
    });

  }, []);


  function drawChart(data) {
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.total));

    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Y axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#1976d2")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Points
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.total))
      .attr("r", 4)
      .attr("fill", "#1976d2");
  }

  return <div ref={ref}></div>;
}