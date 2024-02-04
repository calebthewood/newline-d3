


async function drawLineChart() {
  const data = await d3.json("../data/my_weather_data.json");

  const parseDate = d3.timeParse("%Y-%m-%d");
  const yAccessor = d => d['temperatureMax'];
  const xAccessor = d => parseDate(d['date']);

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

  const listeningRect = bounds.append("rect")
    .attr("class", "listening-rect")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, xAccessor))
    .range([0, dimensions.boundedWidth]);

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
    .style("transform", `translateY(${dimensions.boundedHeight
      }px)`);

  const tooltip = d3.select("#tooltip");
  const tooltipCircle = bounds.append("circle")
    .attr("r", 4)
    .attr("class", "tooltip-circle");

  function onMouseMove(event) {
    const mousePosition = d3.pointer(event);

    const hoveredDate = xScale.invert(mousePosition[0]);
    console.log(hoveredDate);

    const getDistanceFromHoveredDate = d => Math.abs(
      xAccessor(d) - hoveredDate
    );

    const closestIndex = d3.leastIndex(data, (a, b) => (
      getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    ));

    const closestDataPoint = data[closestIndex];
    const closestXValue = xAccessor(closestDataPoint);
    const closestYValue = yAccessor(closestDataPoint);

    const formatDate = d3.timeFormat("%A %B %-d, %Y");
    tooltip.select("#date")
      .text(formatDate(closestXValue));

    const formatTemperature = d => `${d3.format(".1f")(d)}°F`;
    tooltip.select("#temp")
      .text(formatTemperature(closestYValue));

    const x = xScale(closestXValue)
      + dimensions.margins.left;
    const y = yScale(closestYValue)
      + dimensions.margins.top;

    tooltip.style("transform", `translate(`
      + `calc( -50% + ${x}px),`
      + `calc(-100% + ${y}px)`
      + `)`);

    tooltipCircle
      .attr("cx", xScale(closestXValue))
      .attr("cy", yScale(closestYValue))
      .style("opacity", 1);

    tooltip.style("opacity", 1);


  }

  function onMouseLeave(event) {
    tooltip.style("opacity", 0);
    tooltipCircle.style("opacity", 0);
  }

}

drawLineChart();