const data = await d3.csv("../data/love-island-historical-dataset.csv");

console.log(data[0]);
console.log(data[1]);

// age and longest couple length

const X_LABEL = "Longest Couple Length";
const Y_LABEL = "Age";
const COLOR_LABEL = "Gender";
const BLUE = "#0984e3";
const PINK = "#fd79a8";

const xAccessor = d => d["Longest couple length"];
const yAccessor = d => d.Age;
const colorAccessor = d => d.Gender;

const width = d3.min([
  window.innerWidth * 0.9,
  window.innerHeight * 0.9
]);

const dimensions = {
  width: width,
  height: width,
  margin: {
    top: 10,
    right: 10,
    left: 50,
    bottom: 50
  }
};

dimensions.boundedWidth = dimensions.width
  - dimensions.margin.left
  - dimensions.margin.right;
dimensions.boundedHeight = dimensions.height
  - dimensions.margin.top
  - dimensions.margin.bottom;

const wrapper = d3.select("#wrapper")
  .append("svg")
  .attr("height", dimensions.height)
  .attr("width", dimensions.width);

const bounds = wrapper.append("g")
  .style("transform", `translate(
    ${dimensions.margin.left}px,
    ${dimensions.margin.top}px
  )`);

const xScale = d3.scaleLinear()
  .domain(d3.extent(data, xAccessor))
  .range([0, dimensions.boundedWidth])
  .nice();

const yScale = d3.scaleLinear()
  .domain(d3.extent(data, yAccessor))
  .range([dimensions.boundedHeight, 0])
  .nice();

const colorScale = d3.scaleLinear()
  .domain(d3.extent(data, colorAccessor))
  .range([BLUE, PINK]);

const dots = bounds.selectAll("circle")
  .data(data);

dots.join("circle")
  .attr("cx", d => xScale(xAccessor(d)))
  .attr("cy", d => yScale(yAccessor(d)))
  .attr("r", 10)
  .attr("fill", d => d.Gender === "male" ? "#0984e3" : "#fd79a8");

const xAxisGenerator = d3.axisBottom()
  .scale(xScale);

const xAxis = bounds.append("g")
  .call(xAxisGenerator)
  .style("transform", `translateY(${dimensions.boundedHeight}px)`);

const xAxisLabel = xAxis.append("text")
  .attr("x", dimensions.boundedWidth / 2)
  .attr("y", dimensions.margin.bottom - 10)
  .attr("fill", "black")
  .style("font-size", "1.4em")
  .html(X_LABEL);

const yAxisGenerator = d3.axisLeft()
  .scale(yScale);

const yAxis = bounds.append("g")
  .call(yAxisGenerator);

const yAxisLabel = yAxis.append("text")
  .attr("x", -dimensions.boundedHeight / 2)
  .attr("y", -dimensions.margin.left + 10)
  .attr("fill", "black")
  .style("font-size", "1.4em")
  .style("transform", "rotate(-90deg)")
  .style("text-anchor", "middle")
  .html(Y_LABEL);

const colorLabel = bounds.append("g");

colorLabel.append("text")
  .attr("x", (dimensions.boundedWidth / 2) - 50)
  .attr("y", dimensions.margin.bottom + 50)
  .attr("fill", BLUE)
  .style("font-size", "1.4em")
  .html("Boys");

colorLabel.append("text")
  .attr("x", (dimensions.boundedWidth / 2) + 50)
  .attr("y", dimensions.margin.bottom + 50)
  .attr("fill", PINK)
  .style("font-size", "1.4em")
  .html("Girls");

colorLabel.append("text")
  .attr("x", (dimensions.boundedWidth / 2) - 50)
  .attr("y", dimensions.margin.bottom)
  .attr("fill", "black")
  .style("font-size", "2em")
  .html("Love Island");