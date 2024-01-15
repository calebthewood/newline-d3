


async function drawLineChart() {
  // write your code here
  const data = await d3.json("./data/my_weather_data.json");

  const parseDate = d3.timeParse("%Y-%m-%d");
  /* this type of function is called an accessor in d3 context.
  it is primarily useful in that it allows you to define accessing a property in
  one place, then use the accessor wherever you need to access that property.
  It's a small thing, but can reduce redundancy when accessing a property requires
  parsing or some other transformation. It also simplifies refactoring, only one
  place to add or remove transformations. */
  const yAccessor = d => d['temperatureMax']; // no particular transormation here
  const xAccessor = d => parseDate(d['date']); // define parsing once, use everywhere

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margins: {
      top: 15,
      left: 60,
      bottom: 40,
      right: 15,
    }
  };
  dimensions.boundedWidth = dimensions.width
    - dimensions.margins.left
    - dimensions.margins.right;
  dimensions.boundedHeight = dimensions.height
    - dimensions.margins.top
    - dimensions.margins.bottom;

  const wrapper = d3.select("#wrapper");
  const svg = wrapper.append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = svg.append("g")
    .style("transform",
      `translate(${dimensions.margins.left}px,
        ${dimensions.margins.right}px)`);
  /* scaleLinear linearly interpolated withing the given bounds. so in
  this example, the y coordinate for plotting 0 is 345 pixels from the top
  while the y coord for plotting 100, is 0 pixxels from the top. */
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yAccessor))
    .range([dimensions.boundedHeight, 0]);

  const freezingTemperaturePlacement = yScale(32);
  const freezingTemperatures = bounds.append("rect")
    .attr("x", 0)
    .attr("width", dimensions.boundedWidth)
    .attr("y", freezingTemperaturePlacement)
    .attr("height", dimensions.boundedHeight - freezingTemperaturePlacement)
    .attr("fill", "#e0f3f3f3");

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, xAccessor))
    .range([0, dimensions.boundedWidth]);
  // the hard way to do things
  // const basicSVGLine = bounds.append("path")
  //   .attr("d", "M 0 0 L 100 0 L 100 100 L 50 150")
  //   .attr("fill", "#212121");

  const lineGenerator = d3.line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  const line = bounds.append("path")
    .attr("d", lineGenerator(data))
    .attr("fill", "none")
    .attr("stroke", "cornflowerblue")
    .attr("stroke-width", 2);

  // draw peripheries
  const yAxisGenerator = d3.axisLeft()
    .scale(yScale);

  const yAxis = bounds.append("g")
    .call(yAxisGenerator);

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale);

  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${
      dimensions.boundedHeight
    }px)`)

}

// drawLineChart();