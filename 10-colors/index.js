
/* D3 Color Scales */
const d3ColorScales = [{
  title: "Categorical",
  scales: [
      "schemeCategory10",
      "schemeAccent",
      "schemeDark2",
      "schemePaired",
      "schemePastel1",
      "schemePastel2",
      "schemeSet1",
      "schemeSet2",
      "schemeSet3",
      "schemeTableau10",
  ]
},{
  title: "Sequential (Single Hue)",
  scales: [
      "interpolateBlues",
      "interpolateGreens",
      "interpolateGreys",
      "interpolateOranges",
      "interpolatePurples",
      "interpolateReds",
  ]
},{
  title: "Sequential (Multi-Hue)",
  scales: [
      "interpolateTurbo",
      "interpolateViridis",
      "interpolateInferno",
      "interpolateMagma",
      "interpolatePlasma",
      "interpolateCividis",
      "interpolateWarm",
      "interpolateCool",
      "interpolateCubehelixDefault",
      "interpolateBuGn",
      "interpolateBuPu",
      "interpolateGnBu",
      "interpolateOrRd",
      "interpolatePuBuGn",
      "interpolatePuBu",
      "interpolatePuRd",
      "interpolateRdPu",
      "interpolateYlGnBu",
      "interpolateYlGn",
      "interpolateYlOrBr",
      "interpolateYlOrRd",
  ]
},{
  title: "Diverging",
  scales: [
      "interpolateBrBG",
      "interpolatePRGn",
      "interpolatePiYG",
      "interpolatePuOr",
      "interpolateRdBu",
      "interpolateRdGy",
      "interpolateRdYlBu",
      "interpolateRdYlGn",
      "interpolateSpectral",
  ]
  },{
  title: "Cyclical",
  scales: [
      "interpolateRainbow",
      "interpolateSinebow",
  ]
}]
/* End D3 Color Scales */


/* Draw Color Range */
 const drawColorRange = (container, colorScale, scaleName) => {
  const height = 30
  const width = 300

  const svg = container.append("svg")
      .attr("height", height)
      .attr("width", width)

  const gradientId = `gradient--${scaleName}`
  const defs = svg.append("defs")
  const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%")
      .attr("spreadMethod", "pad")

  if (typeof colorScale == "function") {
      const numberOfStops = 30
      const stops = new Array(numberOfStops).fill(0).map((d,i) => i * (1 / (numberOfStops - 1)))

      stops.forEach(stop => {
          gradient.append('stop')
              .attr('offset', stop)
              .attr('stop-color', colorScale(stop))
              .attr('stop-opacity', 1)
      })
  } else if (typeof colorScale == "object") {
      // support
      colorScale.forEach((color, i) => {
          gradient.append('stop')
              .attr('offset', i * (1 / (colorScale.length - 1)))
              .attr('stop-color', color)
              .attr('stop-opacity', 1)
          gradient.append('stop')
              .attr('offset', (i + 1) * (1 / (colorScale.length - 1)))
              .attr('stop-color', color)
              .attr('stop-opacity', 1)
      })
  } else {
      console.log("drawColorRange can only handle scales that are functions or arrays")
  }

  const rect = svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", `url(#${gradientId})`)
}

/* End Draw Color Range */


const contents = d3.select("#contents")

d3ColorScales.map(type => {
  const container = contents.append("div")
      .attr("class", "scale-type")

  container.append("h3")
      .text(type.title)

  type.scales.map(scaleName => {
    container.append("div")
        .text(scaleName)

    const colorScale = d3[scaleName]
    drawColorRange(container, colorScale, scaleName)
  })
})

// create custom scales group
const customScalesContainer = contents.append("div")
    .attr("class", "scale-type")

customScalesContainer.append("h3")
    .text("Custom")

const addCustomScale = (name, scale) => {
  customScalesContainer.append("div")
      .text(name)

  drawColorRange(customScalesContainer, scale, name)
}

const interpolateWithSteps = numberOfSteps => new Array(numberOfSteps).fill(null).map((d, i) => i / (numberOfSteps - 1))

// add more custom scales here
addCustomScale(
  "interpolate-rgb",
  d3.interpolateRgb("cyan", "tomato"),
)

addCustomScale(
  "interpolate-hsl",
  d3.interpolateHsl("cyan", "tomato"),
)

addCustomScale(
  "interpolate-hcl",
  d3.interpolateHcl("cyan", "tomato"),
)

addCustomScale(
  "interpolate-hcl-steps",
  interpolateWithSteps(6).map(
    d3.interpolateHcl("cyan", "tomato")
  )
)

addCustomScale(
  "interpolate-rainbow-steps",
  interpolateWithSteps(10).map(
    d3.interpolateRainbow
  )
)
