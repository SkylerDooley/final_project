import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function FarmTotalsLineChart() {
  const ref = useRef();

  useEffect(() => {
    d3.csv("/year_totals.csv", d => ({
      year: +d.year,
      total: +d.total_farms
    })).then(data => {

      data.sort((a, b) => a.year - b.year);

      drawChart(data);
    });

    function drawChart(data) {
      const width = 700;
      const height = 350;
      const margin = { top: 20, right: 30, bottom: 50, left: 80 };

      d3.select(ref.current).selectAll("*").remove();

      const svg = d3.select(ref.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // scales
      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([margin.left, width - margin.right]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      // axes
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(",")));

      // line generator
      const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.total));

      // line
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#1976d2")
        .attr("stroke-width", 3)
        .attr("d", line);

      // dots
      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.total))
        .attr("r", 5)
        .attr("fill", "#1976d2");
    }
  }, []);

  return <div ref={ref}></div>;
}