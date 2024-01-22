const BAR_COLOR = "cornflowerblue";
const Y_COLOR = "darkgrey";
const MEAN_COLOR = "maroon";

const sammple = {
  century: "1500",
  city: "NA",
  deaths: "1",
  decade: "1520",
  adm0: "Estonia",
  adm1: "NA",
  adm2: "NA",
  lat: "NA",
  lon: "NA",
  recordsource: "Madar (1990)",
  tried: "1",
  year: "NA"
};



async function drawBars() {
  const dataset = await d3.csv("../data/trials.csv");
  // data as is, not useful b/c it's sorted by year, but there's no year value.
  // need to aggregate it aling some metric first. Like deaths/year, deaths/location
  // deaths/century.

  const deathsByField = (data, field) => {
    const freqs = {};
    const output = [];
    data.forEach(record => {
      console.log(record);
      if (record[record[field]] in freqs) {
        freqs[field] += Number(record?.deaths) || 0;
      } else {
        freqs[record[field]] = Number(record?.deaths) || 0;
      }
    });
    console.table(freqs);

    const deathFreqs = Object.entries(freqs);
    console.log("FREQS: ", deathFreqs);

    let current = deathFreqs.pop();
    while (current) {
      const [year, deaths] = current;

      const yearIdx = output.findIndex(item => item.year === year);

      if (yearIdx === -1) {
        output.push({
          year: year,
          deaths: deaths
        });
      } else {
        output[yearIdx].deaths += deaths;
      }

      current = deathFreqs.pop();
    }

    console.log(output);
    return output;
  };

  const data = deathsByField(dataset, "decade");
  console.log(data[0]);

  const metricAccessor = d => d.deaths;
  const yAccessor = d => d.length;

  const width = 600;
  let dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 30,
      right: 10,
      bottom: 50,
      left: 50,
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
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  wrapper.attr("role", "figure")
    .attr("tabindex", "0")
    .append("title")
    .text("Histogram looking at distribution of Witchy stuff.");

  const bounds = wrapper.append("g")
    .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);


  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, metricAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const binsGenerator = d3.bin()
    .domain(xScale.domain())
    .value(metricAccessor);
  // .thresholds(12);

  const bins = binsGenerator(data);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(bins, yAccessor)])
    .range([dimensions.boundedHeight, 0])
    .nice();

  const binsGroup = bounds.append("g")
    .attr("tabindex", "0")
    .attr("role", "list")
    .attr("aria-label", "histogram bars");

  const binGroups = binsGroup.selectAll("g")
    .data(bins)
    .enter().append("g")
    .attr("tabindex", "0")
    .attr("role", "listitem")
    .attr("role", "listitem")
    .attr("aria-label", d => `There many dead witches`);

  const barPadding = 1;
  const barRects = binGroups.append("rect")
    .attr("x", d => xScale(d.x0) + barPadding / 2)
    .attr("y", d => yScale(yAccessor(d)))
    .attr("width", d => d3.max([
      0,
      xScale(d.x1) - xScale(d.x0) - barPadding
    ]))
    .attr("height", d => dimensions.boundedHeight - yScale(yAccessor(d)))
    .attr("fill", BAR_COLOR);

  const barText = binGroups.filter(yAccessor)
    .append("text")
    .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
    .attr("y", d => yScale(yAccessor(d)) - 5)
    .text(yAccessor)
    .style("text-anchor", "middle")
    .attr("fill", Y_COLOR)
    .style("font-size", "12px")
    .style("font-family", "sans-serif");

  const mean = d3.mean(data, metricAccessor);
  const meanLine = bounds.append("line")
    .attr("x1", xScale(mean))
    .attr("x2", xScale(mean))
    .attr("y1", -15)
    .attr("y2", dimensions.boundedHeight)
    .attr("stroke", MEAN_COLOR)
    .attr("stroke-dasharray", "2px 4px");

  const meanLabel = bounds.append("text")
    .attr("x", xScale(mean))
    .attr("y", -20)
    .text("mean")
    .attr("fill", MEAN_COLOR)
    .style("font-size", "12px")
    .style("text-anchor", "middle")
    .attr("role", "presentation")
    .attr("aria-hidden", true);

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale);

  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .attr("role", "presentation")
    .attr("aria-hidden", true);

  const xAxisLabel = xAxis.append("text")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom - 10)
    .attr("fill", "black")
    .style("font-size", "1.4em")
    .text("Deaths")
    .style("text-transform", "capitalize")
    .attr("role", "presentation")
    .attr("aria-hidden", true);
}

drawBars();