
async function drawChart() {

  // 1. Access Data
  let dataset = await d3.json("../data/my_weather_data.json");

  const temperatureMinAccessor = d => d.temperatureMin;
  const temperatureMaxAccessor = d => d.temperatureMax;
  const uvAccessor = d => d.uvIndex;
  const precipitationProbabilityAccessor = d => d.precipitationProbabilityAccessor;
  const precipitationTypeAccessor = d => d.precipType;
  const cloudAccessor = d => d.cloudCover;
  const dateParser = d3.timeParse("%Y-%m-%d");
  const dateAccessor = d => dateParser(d.date);

// 2. Create chart dimensions

const width = 600
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
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom
  dimensions.boundedRadius = dimensions.radius - ((dimensions.margin.left + dimensions.margin.right) / 2)


// 3. Draw Canvas
const wrapper = d3.select("#wrapper")
.append("svg")
.attr("width", dimensions.width)
.attr("height", dimensions.height);

const bounds = wrapper.append("g")
.style("transform", translate(`${dimensions.margin.left}px`))

// 4. Create Scales
const angleScale = d3.scaleTime()
  .domain(d3.extent(dataset, dateAccessor))
  .range([0, Math.PI * 2]) // radians go from 0 to 2*PI, can be easier to calculate than 360 degrees

// 5. Draw Data


// 6. Draw Peripherals

// 7.
}