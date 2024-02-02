async function createEvent() {
  const rectColors = [
    "yellowgreen",
    "cornflowerblue",
    "seagreen",
    "slateblue",
  ];

  // create and bind data to our rects
  const rects = d3.select("#svg")
    .selectAll(".rect")
    .data(rectColors)
    .join("rect")
    .attr("height", 100)
    .attr("width", 100)
    .attr("x", (d, i) => i * 110)
    .attr("fill", "lightgrey");

  // your code here
  rects
    .on("mouseenter", (event, d) => {
      const selection = d3.select(event.currentTarget);
      selection.attr("fill", d);
      console.log({ event, d });
    })
    .on("mouseleave", (event) => {
      const selection = d3.select(event.currentTarget);
      selection.attr("fill", "lightgrey");
    });

  function cleanup() {
    rects
      .dispatch("mouseleave") // triggers mouseleave event
      .on("mouseenter", null) // remove mouseenter event
      .on("mouseleave", null); //remove mouseleave event
  }
}
createEvent();