/*Objective: Build a CodePen.io app that is functionally similar to this: https://codepen.io/FreeCodeCamp/full/ONxvaa/.

Fulfill the below user stories. Use whichever libraries or APIs you need. Give it your own personal style.

User Story: I can see performance time visualized in a scatterplot graph.

User Story: I can mouse over a plot to see a tooltip with additional details.

Hint: Here's a dataset you can use to build this: https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json

Remember to use Read-Search-Ask if you get stuck.

When you are finished, click the "I've completed this challenge" button and include a link to your CodePen.

You can get feedback on your project by sharing it with your friends on Facebook.*/

function ScatterPlot(data, title='') {
  const SVG_WIDTH = 1000
  const SVG_HEIGHT = 600
  const MARGIN = {
    LEFT: 150,
    RIGHT: 150,
    TOP: 100,
    BOTTOM: 150,
  }
  const CHART_WIDTH = SVG_WIDTH - MARGIN.LEFT - MARGIN.RIGHT
  const CHART_HEIGHT = SVG_HEIGHT - MARGIN.TOP - MARGIN.BOTTOM
  
  const TITLE_FONT_SIZE = '30px'
  
  const NUM_SAMPLES = data.length

  const svg = d3.select('.container')
    .append('svg')
    .attr('height', '100%')
    .attr('width', '100%')
    .attr('viewBox', `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`)
    .attr('preserveAspectRatio', 'none')

  // Add tooltip div
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  // Add axes
  const scaleY = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Place)])
    .range([0, CHART_HEIGHT])

  // Reduce X values by the minimum time
  const MIN_X = d3.min(data, d => d.Seconds)
  const domainX = [
    data[0].Seconds - MIN_X,
    data[34].Seconds + 20 - MIN_X
  ]
  const scaleX = d3.scaleLinear()
    .domain(domainX.reverse())
    .range([0, CHART_WIDTH])

  const yAxis = d3.axisLeft(scaleY)
  const xAxis = d3.axisBottom(scaleX)
  xAxis.tickFormat( seconds => `${Math.floor(seconds/60)}:${seconds%60}`)

  svg.append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
      .classed('y-axis', true)
    .call(yAxis)
    .selectAll('text')
    .attr('font-size', '16px')

  svg.append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${SVG_HEIGHT - MARGIN.BOTTOM})`)
      .classed('x-axis', true)
    .call(xAxis)
    .selectAll('text')
      .attr('font-size', '16px')
      .attr('transform', 'rotate(-30deg)')
      // .style('text-anchor', 'end')

  // add bars
  const bars = svg.append('g')
      .attr('id', 'points')
      .attr('transform', `translate(${MARGIN.LEFT} ${MARGIN.TOP})`)
    .selectAll('circle')
    .data(data)
    .enter()
      .append('circle')
      .attr('cx', d => scaleX(d.Seconds - MIN_X))
      .attr('cy', d => scaleY(d.Place))
      .attr('r', 5)
      .attr('fill', d => d.Doping)
      .on('mouseover', (d) => {
        tooltip.transition()
          .duration(150)
          .style('opacity', .9)
        tooltip.html(
          `<p>$ Billion</p>
          <p>Tooltip stuff</p>`
        )	
        .style('left', `${d3.event.pageX - 50}px`)
        .style('top', `${d3.event.pageY - 100}px`)
      })
      .on('mouseout', function(d) {		
        tooltip.transition()		
            .duration(100)		
            .style('opacity', 0)
      })
  
  // Add Title
  const chartTitle = svg.append('text')
    .text(title)
    .attr('id', 'chart-title')
    .attr('fill', 'black')
    .attr('transform', `translate(${MARGIN.LEFT + 100} ${MARGIN.TOP})`)
    .attr('font-size', TITLE_FONT_SIZE);
}

(async () => {
  const data = await fetch('static/data/cyclist-data.json').then(r => r.json())
  ScatterPlot(
    data,
    'Doping in Professional Bike Racing'
  )
})()