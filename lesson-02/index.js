
async function drawChart() {
  const data = await d3.json("../data/my_weather_data.json");
  console.log(data[0])
}

drawChart();