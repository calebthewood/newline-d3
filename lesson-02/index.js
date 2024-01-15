
async function drawChart() {
  const data = await d3.json("../data/my_weather_data.json");
  console.log(data[0]);

  /** X Axis: Dew Point */
  const xAccessor = d => d.dewPoint;
  /** Y Axis: Humidity */
  const yAccessor = d => d.humidity;

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

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();



  function drawWithJoin() {
    const dots = bounds.selectAll("circle")
      .data(data);

    console.log(dots);
    // .join combines .enter(), .append(), .merge()
    // great for just drawing a chart, but not useful for dynamic charts.
    dots.join("circle")
      .attr("cx", d => xScale(xAccessor(d)))
      .attr("cy", d => yScale(yAccessor(d)))
      .attr("r", 5)
      .attr("fill", "cornflowerblue");
  }

  function drawWithEnterMerge() {
    const dots = bounds.selectAll("circle")
      .data(data);

    dots
      .enter().append("circle")
      .merge(dots)
      .attr("cx", d => xScale(xAccessor(d)))
      .attr("cy", d => yScale(yAccessor(d)))
      .attr("r", 5)
      .attr("fill", "#212121");
  }
  drawWithEnterMerge()
}

drawChart();