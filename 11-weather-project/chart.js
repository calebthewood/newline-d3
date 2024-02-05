
async function drawChart() {

  // 1. Access Data

  let dataset = await d3.json("../data/my_weather_data.json");

  const temperatureMinAccessor = d => d.temperatureMin;
  const temperatureMaxAccessor = d => d.temperatureMax;
  const uvAccessor = d => d.uvIndex;
  const precipitationProbabilityAccessor = d => d.precipProbability;
  const precipitationTypeAccessor = d => d.precipType;
  const cloudAccessor = d => d.cloudCover;
  const dateParser = d3.timeParse("%Y-%m-%d");
  const dateAccessor = d => dateParser(d.date);

  // 2. Create chart dimensions

  const width = 600;
  let dimensions = {
    width: width,
    height: width,
    radius: width / 2,
    margin: {
      top: 120,
      right: 120,
      bottom: 120,
      left: 120,
    },
  };
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
  dimensions.boundedRadius = dimensions.radius - ((dimensions.margin.left + dimensions.margin.right) / 2);

  // 3. Draw Canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = wrapper.append("g")
    .style("transform", `translate(${dimensions.margin.left + dimensions.boundedRadius
      }px, ${dimensions.margin.top + dimensions.boundedRadius
      }px)`);


  const defs = wrapper.append("defs");
  const gradientId = "temperature-gradient";
  const gradient = defs.append("radialGradient")
    .attr("id", gradientId);
  const numStops = 10;
  const gradientColorScale = d3.interpolateYlOrRd; // check out other color options
  d3.range(numStops).forEach(i => {
    gradient.append("stop")
      .attr("offset", `${i * 100 / (numStops - 1)}%`)
      .attr("stop-color", gradientColorScale(
        i / (numStops - 1)
      ));
  });

  // 4. Create Scales

  const angleScale = d3.scaleTime()
    .domain(d3.extent(dataset, dateAccessor))
    .range([0, Math.PI * 2]); // radians go from 0 to 2*PI, can be easier to calculate than 360 degrees


  const radiusScale = d3.scaleLinear()
    .domain(d3.extent([
      ...dataset.map(temperatureMinAccessor),
      ...dataset.map(temperatureMaxAccessor),
    ])) // need array of min and max values
    .range([0, dimensions.boundedRadius])
    .nice();

  // 5. Draw Data

  const getCoordinatesForAngle = (angle, offset = 1) => [
    /*
    Geometry time!

    x=adjacent
    radius = hypotenuse
    y = opposite

    "sohcahtoa"
    sin(0) = opposite/hypotenuse
    cos(0) = adjacent/hypotenuse
    tan(0) = opposite/adjacent
    */
    Math.cos(angle - Math.PI / 2) * dimensions.boundedRadius * offset,
    Math.sin(angle - Math.PI / 2) * dimensions.boundedRadius * offset,
  ];

  const getXFromDataPoint = (d, offset = 1.4) => (
    getCoordinatesForAngle(
      angleScale(dateAccessor(d)), offset
    )[0]
  );

  const getYFromDataPoint = (d, offset = 1.4) => (
    getCoordinatesForAngle(
      angleScale(dateAccessor(d)), offset
    )[1]
  );

  const containsFreezing = radiusScale.domain()[0] < 32;

  // 6. Draw Peripherals

  const peripherals = bounds.append("g");
  const months = d3.timeMonth.range(...angleScale.domain());

  months.forEach(month => {
    const angle = angleScale(month);
    const [x, y] = getCoordinatesForAngle(angle, 1);

    peripherals.append("line")
      .attr("x2", x)
      .attr("y2", y)
      .attr("class", "grid-line");

    const [labelX, labelY] = getCoordinatesForAngle(angle, 1.38);
    peripherals.append("text")
      .attr("x", labelX)
      .attr("y", labelY)
      .text(d3.timeFormat("%b")(month))
      .style("text-anchor",
        Math.abs(labelX) < 5 ? "middle" :
          labelX > 0 ? "start" : "end");
  });

  const temperatureTicks = radiusScale.ticks(4);

  const gridCircles = temperatureTicks.map(d => {
    peripherals.append("circle")
      .attr("r", radiusScale(d))
      .attr("class", "grid-line");
  });


  const tickLabelBackgrounds = temperatureTicks.map(d => {
    if (d < 1) return;
    return peripherals.append("rect")
      .attr("y", -radiusScale(d) - 10)
      .attr("width", 36)
      .attr("height", 20)
      .attr("fill", "#f8f9fa");
  });

  const gridLabels = temperatureTicks.map(d => {
    if (d < 1) return;
    return peripherals.append("text")
      .attr("x", 4)
      .attr("y", -radiusScale(d) + 2)
      .attr("class", "tick-label-temperature")
      .html(`${d3.format(".0f")(d)}°F`);
  });

  if (containsFreezing) {
    const freezingCircle = bounds.append("circle")
      .attr("r", radiusScale(32))
      .attr("class", "freezing-circle");
  }

  /* because we're working with a circle where the radian is determined
  by the date, angle here corresponds to a date, moving around the circle
  is progressing forward through our data's dates */
  const areaGenerator = d3.areaRadial()
    .angle(d => angleScale(dateAccessor(d)))
    .innerRadius(d => radiusScale(temperatureMinAccessor(d)))
    .outerRadius(d => radiusScale(temperatureMaxAccessor(d)));

  const area = bounds.append("path")
    .attr("d", areaGenerator(dataset))
    .style("fill", `url(#${gradientId})`);

  const uvIndexThreshold = 8;
  const uvGroup = bounds.append("g");
  const uvOffset = 0.95;
  // this is called a 'databind'
  const highUvDays = uvGroup.selectAll("line")
    .data(dataset.filter(d => uvAccessor(d) > uvIndexThreshold))
    .join("line")
    .attr("class", "uv-line")
    .attr("x1", d => getXFromDataPoint(d, uvOffset))
    .attr("x2", d => getXFromDataPoint(d, uvOffset + 0.1))
    .attr("y1", d => getYFromDataPoint(d, uvOffset))
    .attr("y2", d => getYFromDataPoint(d, uvOffset + 0.1));

  // 7. Set up interactions

}

drawChart();