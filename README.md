# Data Viz with D3
A repo for tracking progress as I work through [newline's D3 Masterclass](https://www.newline.co/courses/fullstack-d3-masterclass).

### Lesson 1: Drawing a Line Chart
- Walked through the basics of d3. This included using accessor functions to access falues and pass as callbacks; selecting and appending to the dom with d3; creating the layout for a chart, including setting a domain, range, bounds, and scale; learning the basics of using svgs within d3 to draw paths and shapes.

### Lesson 2: Drawing a Scatter Chart
- Solidifying principals started in Lesson 1. Taking a deeper look the process of setting up
a d3 data viz: accessing data, creating dimensions, drawing canvas and wrapper, creating scales, drawing data, drawing peripherals, adding interactions.
Square is ideal for scatterplots b/c we're comparing two values, visually and keeping
them proportional ensures we're viewing them accurately. To ensure we get the max
space possible whether we're landscape or portrait we can check height and width;
choosing the smaller to be our height and width. Also learned about D3.min which
is similar to Math.min, but won't return 0 for null or NaN for undefined or strings.
In general. It does return undefined for empty arrays.

- the *wrapper* is your entire SVG element, containing your axes, data elements, and legends
- the *bounds* live inside of the wrapper, containing just the data elements

### Lesson 3: Histograms

Learned to draw histograms and bar charts. Added chart annotations. Incorporated
clickity clackity buttons for interactivity. Transformed data to useful format.

## Lesson 4: Animations

Note to self, svg animations exist, but they should be avoided. Use CSS. JS
animations also exist, but whenever possible, use CSS. It's better, more and
more performant.

## Lesson 5: Animating Line Graph

## Lesson 6: Interactions

### Browser Events
Browser has a wide array of events we can listen for and repsond to. Most common being the click event.

