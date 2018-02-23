function BarChart(json, title='') {
  const SVG_WIDTH = 1000
  const SVG_HEIGHT = 600
  const MARGIN = {
    LEFT: 100,
    RIGHT: 20,
    TOP: 50,
    BOTTOM: 100,
  }
  const CHART_WIDTH = SVG_WIDTH - MARGIN.LEFT - MARGIN.RIGHT
  const CHART_HEIGHT = SVG_HEIGHT - MARGIN.TOP - MARGIN.BOTTOM
  
  const TITLE_FONT_SIZE = '30px'
  console.log(json)
  const data = json.data
  const NUM_SAMPLES = data.length
  const MAX_Y = d3.max(data, d => d[1])
  const BAR_WIDTH = Math.floor(CHART_WIDTH / NUM_SAMPLES)

  const svg = d3.select('body')
    .append('div')
    .attr('class', 'container')
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
    .domain([0, MAX_Y])
    .range([CHART_HEIGHT, 0])

  const scaleX = d3.scaleTime()
    .domain([new Date(data[0][0]), new Date(data[NUM_SAMPLES-1][0])])
    .range([0, BAR_WIDTH * NUM_SAMPLES])

  const yAxis = d3.axisLeft(scaleY)
  const xAxis = d3.axisBottom(scaleX)
  xAxis.tickFormat(d3.timeFormat('%B %Y'))

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
      .attr('transform', 'rotate(-30)')
      .style('text-anchor', 'end')

  // add bars
  const bars = svg.append('g')
      .attr('id', 'bars')
      .attr('transform', `translate(${MARGIN.LEFT} ${MARGIN.TOP})`)
    .selectAll('rect')
    .data(data)
    .enter()
      .append('rect')
      .attr('x', d => scaleX(new Date(d[0])))
      .attr('y', d => scaleY(d[1]))
      .attr('width', BAR_WIDTH)
      .attr('height', d => CHART_HEIGHT - scaleY(d[1]))
      .attr('fill', 'darkgreen')
      .on('mouseover', (d) => {
        let date = new Date(d[0])
        tooltip.transition()
          .duration(150)
          .style('opacity', .9)
        tooltip.html(
          `<p>$${d[1]} Billion</p>
          <p>${date.toLocaleString('en-us', {month: 'long'})} ${date.getFullYear()}</p>`
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
  const data = await fetch('GDP-data.json').then(r => r.json())
  BarChart(
    data,
    'Quarterly Gross Domestic Product (in billions of $)'
  )
})()