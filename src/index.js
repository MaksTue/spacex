import { SpaceX } from "./api/spacex";
import * as d3 from "d3";
import * as Geo from "./geo.json";

document.addEventListener("DOMContentLoaded", setup);

function setup() {
  const spaceX = new SpaceX();
  spaceX.launchpads().then((data) => {
    const listContainer = document.getElementById("listContainer");
    renderLaunchpads(data, listContainer);
    drawMap(data);
    setEventHandlers();
  });
}

function renderLaunchpads(launches, container) {
  const list = document.createElement("ul");
  launches.forEach((launch) => {
    const item = document.createElement("li");
    item.innerHTML = launch.name;
    item.setAttribute("id", launch.id);
    list.appendChild(item);
  });
  container.replaceChildren(list);
}

function setEventHandlers() {
  const listItems = document.querySelectorAll("#listContainer ul li");
  listItems.forEach((item) => {
    item.addEventListener("mouseover", () => {
      const itemId = item.id;
      d3.select(`circle[id='${itemId}']`).style("fill", "red");
    });

    item.addEventListener("mouseout", () => {
      const itemId = item.id;
      d3.select(`circle[id='${itemId}']`).style("fill", "blue");
    });
  });
}

const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 1]);

function drawMap(launchpadsData) {
  const width = 800;
  const height = 600;
  const margin = { top: 20, right: 10, bottom: 40, left: 100 };
  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  const projection = d3
    .geoMercator()
    .scale(120)
    .center([0, 20])
    .translate([width / 2 - margin.left, height / 2]);
  svg
    .append("g")
    .selectAll("path")
    .data(Geo.features)
    .enter()
    .append("path")
    .attr("class", "topo")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", function (d) {
      return colorScale(0);
    })
    .style("opacity", 0.7);

  svg
    .selectAll(".launchpads")
    .data(launchpadsData)
    .enter()
    .append("circle")
    .attr("class", "launchpads")
    .attr("cx", function (d) {
      return projection([d.longitude, d.latitude])[0];
    })
    .attr("cy", function (d) {
      return projection([d.longitude, d.latitude])[1];
    })
    .attr("id", function (d) {
      return d.id; // уникальный id для каждой точки
    })
    .attr("r", 5) // Размер точек
    .style("fill", "blue") // Цвет точек
    .style("opacity", 0.7);
}
