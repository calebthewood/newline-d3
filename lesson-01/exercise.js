
/** Exercise 1
 * Create my own line chart with one of the provided data sets.
 * Lighthouse data ideas:
 *   [x] reach/years
 *   [ ] numberBuilt/years
 *   [ ] averageHeight/years
 */
async function drawChart() {
  let data = await d3.csv("../data/HistoricalLighthouses.csv");
  // data = parseReachByYear(data);
  data = avgHeightByYear(data);

  const parseDate = d3.timeParse("%Y");

  const yAcceesor = d => d["avg_height"];
  const xAcceesor = d => parseDate(d["year"]);

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
  dimensions.boundWidth = dimensions.width
    - dimensions.margins.left
    - dimensions.margins.right;
  dimensions.boundedHeight = dimensions.height
    - dimensions.margins.top
    - dimensions.margins.bottom;

  const wrapper = d3.select("#wrapper-exc");
  const svg = wrapper.append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = svg.append("g")
    .style("transform",
      `translate(${dimensions.margins.left}px,
      ${dimensions.margins.right}px)`);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yAcceesor))
    .range([dimensions.boundedHeight, 0]);

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, xAcceesor))
    .range([0, dimensions.boundWidth]);

  const lineGenerator = d3.line()
    .x(d => xScale(xAcceesor(d)))
    .y(d => yScale(yAcceesor(d)));

  const line = bounds.append("path")
    .attr("d", lineGenerator(data))
    .attr("fill", "none")
    .attr("stroke", "cornflowerblue")
    .attr("stroke-width", 2);

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
}

function parseReachByYear(data) {
  /* the plan...
data = []
for years in range(1831,1911),
  reachSum = 0
  lhCount = 0
  for lighthouse in lighthouses
    if lighthouse has been built,
      lhCount++
      reach += currentReach
  data.push({
    year,
    reach: reachSum/lhCount
  })
  data = [{year: 1831, avgReach: 13}, ..., {year: 1911, avgReach: 20}]
*/
  const lighthouses = [];
  let end = 1911;
  for (let year = 1831; year <= end; year++) {
    let reachSum = 0;
    let lhCount = 0;

    for (let lighthouse of data) {
      let yearBuilt = Number(lighthouse.YearBuilt);
      yearBuilt = isNaN(yearBuilt) ? 0 : yearBuilt;

      if (yearBuilt <= year) {
        let reach = 0;

        if (year < 1851) {
          reach = Number(lighthouse["REACH_1831"]);
        } else if (year < 1911) {
          reach = Number(lighthouse["REACH_1851"]);
        } else {
          reach = Number(lighthouse["REACH_1911"]);
        }

        if (reach > 0) {
          lhCount++;
          reachSum += reach;
        }
      }
    }
    if (lhCount > 0 && reachSum > 0) {
      lighthouses.push({
        year,
        reachAvg: Math.round((reachSum / lhCount) * 100) / 100
      });
    }
  }
  return lighthouses;
}

function avgHeightByYear(data) {
  let start = Infinity;
  let end = 0;
  let step = 1;
  for (let { YearBuilt } of data) {
    let built = Number(YearBuilt);
    if (built > 0) {
      start = Math.min(start, built);
      end = Math.max(end, built);
    }
  }

  const output = Array.from(
    { length: (end - start) + 1 / step + 1 }, (_, i) => {
      return {
        year: start + i * step,
        sum: 0,
        count: 0,
      };
    });

  for (let { YearBuilt, Height } of data) {

    let yearBuilt = Number(YearBuilt);
    let isBuilt = yearBuilt > 0;

    let height = Number(Height);
    let hasHeight = height > 0;

    if (isBuilt && hasHeight) {
      for (let i = yearBuilt - start; i < output.length; i++) {
        output[i]['sum'] += height;
        output[i]['count'] += 1;
      }
    }
  }

  for (let i = 0; i < output.length; i++) {
    let { sum, count } = output[i];
    output[i]["avg_height"] = Math.round(sum / count);
  }
  return output;
}

drawChart();