

const data = await d3.json("../data/my_weather_data.json");
// console.log(data[0]);
const X_LABEL = "Dew Point &deg;F";
const Y_LABEL = "Humidity";
/** X Axis: Dew Point */
const xAccessor = d => d.dewPoint;
/** Y Axis: Humidity */
const yAccessor = d => d.humidity;
/** Color: Cloud Cover */
const colorAccessor = d => d.cloudCover;

// to keep box proportional on portrait or landscape, we check H and W, taking the min
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
// need to explicitly size bounds b/c we're working with svgs, which aren't as
// smart as html elements.
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

// fun fact: the scales are functions, logging them is useless, and they return
// undefined so this leads me to assume they are mutating some internal D3 state
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
  .range(["skyblue", "darkslategrey"]);

const dots = bounds.selectAll("circle")
  .data(data);

// .join combines .enter(), .append(), .merge()
// great for just drawing a chart, but not useful for dynamic charts.
dots.join("circle")
  .attr("cx", d => xScale(xAccessor(d)))
  .attr("cy", d => yScale(yAccessor(d)))
  .attr("r", 5)
  .attr("fill", d => colorScale(colorAccessor(d)));

// function drawWithEnterMerge() {
//   const dots = bounds.selectAll("circle")
//     .data(data);

//   dots
//     .enter().append("circle")
//     .merge(dots)
//     .attr("cx", d => xScale(xAccessor(d)))
//     .attr("cy", d => yScale(yAccessor(d)))
//     .attr("r", 5)
//     .attr("fill", d => colorScale(colorAccessor(d)));
// }
// drawWithEnterMerge();

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
  .scale(yScale)
  .ticks(4); // ticks is a suggestion, d3 will pick it's own nice even numbers

const yAxis = bounds.append("g")
  .call(yAxisGenerator);

const yAxisLabel = yAxis.append("text")
  .attr("x", -dimensions.boundedHeight / 2) // got hung up here b/c I didn't see the "-"
  .attr("y", -dimensions.margin.left + 10)  // take note!
  .attr("fill", "black")
  .style("font-size", "1.4em")
  .style("transform", "rotate(-90deg)")
  .style("text-anchor", "middle")
  .html(Y_LABEL);


bounds.selectAll("circle")
  .on("mouseenter", onMouseEnter)
  .on("mouseleave", onMouseLeave);

const tooltip = d3.select("#tooltip");

function onMouseEnter(event, d) {

  const formatHumidity = d3.format(".2f");
  tooltip.select("#humidity")
    .text(formatHumidity(yAccessor(d)));

  const formatDewPoint = d3.format(".2f");
  tooltip.select("#dew-point")
    .text(formatDewPoint(xAccessor(d)));

  /* D3 Date Formats
    %Y: the full year
    %y: the last two digits of the year
    %m: the padded month (eg. "01")
    %-m: the non-padded month (eg. "1")
    %B: the full month name
    %b: the abbreviated month name
    %A: the full weekday name
    %a: the abbreviated weekday name
    %d: the day of the month
  */

  const dateParser = d3.timeParse("%Y-%m-%d");
  const formatDate = d3.timeFormat("%A %B %-d, %Y");
  console.log(formatDate(dateParser(d.date)));
  tooltip.select("#date")
    .text(formatDate(dateParser(d.date)));

  const x = xScale(xAccessor(d))
    + dimensions.margin.left;
  const y = yScale(yAccessor(d))
    + dimensions.margin.top;

  tooltip
    .style("transform", `translate(`
      + `calc( -50% + ${x}px),`
      + `calc(-100% + ${y}px)`
      + `)`)
    .style("opacity", 1);
}

function onMouseLeave() {
  tooltip.style("opacity", 0);
}