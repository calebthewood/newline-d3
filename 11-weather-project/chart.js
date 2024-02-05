"use-strict";
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

  /* Circle Geometry!
    area = 2 * PI * r
    radius = sqrt(area) / PI

    Note that radius and area do not scale linearly for circles
    a doubling the radius may roughly quadruple the area. We also
    don't percieve circle area linearly. For these reasons, we adjust
    circle areas on sqrt scale
  */
  const cloudRadiusScale = d3.scaleSqrt()
    .domain(d3.extent(dataset, cloudAccessor))
    .range([1, 10]);

  const precipitationRadiusScale = d3.scaleSqrt()
    .domain(d3.extent(dataset, precipitationProbabilityAccessor))
    .range([0, 8]); // 0-8 px

  const precipitationTypes = ["rain", "sleet", "snow"];
  const precipitationTypeColorScale = d3.scaleOrdinal()
    .domain(precipitationTypes)
    .range(["#54a0ff", "#636e72", "#b2bec3"]);

  const temperatureColorScale = d3.scaleSequential()
    .domain(d3.extent([
      ...dataset.map(temperatureMaxAccessor),
      ...dataset.map(temperatureMinAccessor),
    ]))
    .interpolator(gradientColorScale);
}

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
    .attr("class", "month-text")
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

const cloudGroup = bounds.append("g");
const cloudOffset = 1.27;
const clouDots = cloudGroup.selectAll("circle")
  .data(dataset)
  .join("circle")
  .attr("class", "cloud-dot")
  .attr("cx", d => getXFromDataPoint(d, cloudOffset))
  .attr("cy", d => getYFromDataPoint(d, cloudOffset))
  .attr("r", d => cloudRadiusScale(cloudAccessor(d)));

const precipitationGroup = bounds.append("g");
const precipitationOffset = 1.14;
const precipitationDots = precipitationGroup.selectAll("circle")
  .data(dataset.filter(precipitationTypeAccessor))
  .join("circle")
  .attr("class", "precipitation-dot")
  .attr("cx", d => getXFromDataPoint(d, precipitationOffset))
  .attr("cy", d => getYFromDataPoint(d, precipitationOffset))
  .attr("r", d => precipitationRadiusScale(
    precipitationProbabilityAccessor(d)
  ))
  .style("fill", d => precipitationTypeColorScale(
    precipitationTypeAccessor(d)
  ));


const annotationsGroup = bounds.append("g");

const drawAnnotations = (angle, offset, text) => {
  const [x1, y1] = getCoordinatesForAngle(angle, offset);
  const [x2, y2] = getCoordinatesForAngle(angle, 1.6);

  annotationsGroup.append("line")
    .attr("x1", x1)
    .attr("x2", x2)
    .attr("y1", y1)
    .attr("y2", y2)
    .attr("class", "annotation-line");

  annotationsGroup.append("text")
    .attr("x", x2 + 6)
    .attr("y", y2)
    .attr("class", "annotations-text")
    .text(text);
};

drawAnnotations(Math.PI * 0.23, cloudOffset, "Cloud Cover"); // radians, not degrees
drawAnnotations(Math.PI * 0.26, precipitationOffset, "Precipitation"); // radians, not degrees
drawAnnotations(Math.PI * 0.734, uvOffset, `UV Index > ${uvIndexThreshold}`); // radians, not degrees
drawAnnotations(Math.PI * 0.7, 0.5, `Temperature`); // radians, not degrees
drawAnnotations(Math.PI * 0.9, radiusScale(32) / dimensions.boundedRadius, `Freezing`); // radians, not degrees


precipitationTypes.forEach((precipType, i) => {
  const [labelX, labelY] = getCoordinatesForAngle(Math.PI * 0.26, 1.6);

  annotationsGroup.append("circle")
    .attr("cx", labelX + 15)
    .attr("cy", labelY + (16 * (i + 1)))
    .attr("r", 4)
    .style("opacity", 0.7)
    .attr("fill", precipitationTypeColorScale(precipType));

  annotationsGroup.append("text")
    .attr("class", "annotations-text")
    .attr("x", labelX + 25)
    .attr("y", labelY + (16 * (i + 1)))
    .text(precipType);
});

// 7. Set up interactions
const listenerCircle = bounds.append("circle")
  .attr("r", dimensions.width / 2)
  .attr("class", "listener-circle")
  .on("mousemove", onMouseMove)
  .on("mouseleave", onMouseLeave);

const tooltip = d3.select("#tooltip");
const tooltipLine = bounds.append("path")
  .attr("class", "tooltip-line");

function onMouseMove(event) {
  const [x, y] = d3.pointer(event);

  const getAngleFromCoordinates = (x, y) => {
    return Math.atan2(y, x);
  };

  let angle = getAngleFromCoordinates(x, y) + Math.PI / 2;
  if (angle < 0) angle = (Math.PI * 2 + angle); // handle negative in top-left quad


  const tooltipArcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(dimensions.boundedRadius * 1.6)
    .startAngle(angle - 0.015)
    .endAngle(angle + 0.015);

  tooltipLine
    .attr("d", tooltipArcGenerator())
    .style("opacity", 1);

  const outerCoordinates = getCoordinatesForAngle(angle, 1.6);
  // positions the tooltip as you hover over the viz
  tooltip.style("opacity", 1)
    .style("transform", `translate(calc(${outerCoordinates[0] < -50 ? "40px + -100" :
      outerCoordinates[0] > 50 ? "-40px + 0" :
        -50
      }% + ${outerCoordinates[0] + dimensions.margin.left + dimensions.boundedRadius
      }px), calc(${outerCoordinates[1] < -50 ? "40px + -100" :
        outerCoordinates[1] > 50 ? "-40px + 0" :
          -50
      }% + ${outerCoordinates[1] + dimensions.margin.top + dimensions.boundedRadius
      }px))`);

  const date = angleScale.invert(angle);
  const dateString = d3.timeFormat("%Y-%m-%d")(date);
  const dataPoint = dataset.find(d => d.date === dateString);
  if (!dataPoint) return;

  tooltip.select("#tooltip-date")
    .text(d3.timeFormat("%B %-d")(date));
  tooltip.select("#tooltip-temperature-min")
    .html(`${d3.format(".1f")(temperatureMinAccessor(dataPoint))}°F`);
  tooltip.select("#tooltip-temperature-max")
    .html(`${d3.format(".1f")(temperatureMaxAccessor(dataPoint))}°F`);
  tooltip.select("#tooltip-uv")
    .text(uvAccessor(dataPoint));
  tooltip.select("#tooltip-cloud")
    .text(cloudAccessor(dataPoint));
  tooltip.select("#tooltip-precipitation")
    .text(d3.format(".0%")(precipitationProbabilityAccessor(dataPoint)));
  tooltip.select("#tooltip-precipitation-type")
    .text(precipitationTypeAccessor(dataPoint));
  tooltip.select(".tooltip-precipitation-type")
    .style("color", precipitationTypeAccessor(dataPoint)
      ? precipitationTypeColorScale(precipitationTypeAccessor(dataPoint))
      : "#dadadd");



  tooltip.select("#tooltip-temperature-min")
    .style("color", temperatureColorScale(
      temperatureMinAccessor(dataPoint)
    ));
  tooltip.select("#tooltip-temperature-max")
    .style("color", temperatureColorScale(
      temperatureMaxAccessor(dataPoint)
    ));

  function onMouseLeave(event) {
    tooltip.style("opacity", 0);
    tooltipLine.style("opacity", 0);
  }
}

drawChart();