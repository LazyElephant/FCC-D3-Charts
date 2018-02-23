function HeatMap(data) {

  // layout constants
  const VIEWBOX_WIDTH = 1000
  const VIEWBOX_HEIGHT = 600
  const MARGIN = {
        LEFT: 150,
        RIGHT: 50,
        TOP: 150,
        BOTTOM: 100,}
  const CHART_WIDTH = VIEWBOX_WIDTH - MARGIN.LEFT - MARGIN.RIGHT
  const CHART_HEIGHT = VIEWBOX_HEIGHT - MARGIN.TOP - MARGIN.BOTTOM
  
  const NUM_SAMPLES = data.length
  const BAR_WIDTH = Math.ceil(CHART_WIDTH / NUM_SAMPLES)
  const BAR_HEIGHT = Math.ceil(CHART_HEIGHT / 12)

  // styling constants
  const LABEL_FONT_SIZE = '25px'
  const TITLE_FONT_SIZE = '40px'
  const TICK_FONT_SIZE = '16px'
  
  // labels
  const TITLE = 'Monthly Global Land Surface Temperature in °C'
  const SUBTITLE = 'from 1753 to 2015'
  const X_LABEL = 'Years'
  const Y_LABEL = 'Month'
  const MONTHS = [
    'January', 
    'February', 
    'March', 
    'April', 
    'May', 
    'June', 
    'July', 
    'August', 
    'September', 
    'October', 
    'November', 
    'December'
  ]

  // data constants
  const [MIN_TEMP, MAX_TEMP] = d3.extent(data, d => d.temperature)
  const [MIN_YEAR, MAX_YEAR] = d3.extent(data, d => d.year)

  // scales
  const xScale = d3.scaleLinear().domain([MIN_YEAR, MAX_YEAR]).range([0, CHART_WIDTH])
  const yScale = d3.scaleLinear().domain([1, 13]).range([0, CHART_HEIGHT])
  const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([MAX_TEMP, MIN_TEMP])
  
  const legendColors = d3.range(0, MAX_TEMP).map(colorScale)

  const svg = d3.select('body')
    .append('div')
    .attr('class', 'container')
    .append('svg')
    .attr('height', '100%')
    .attr('width', '100%')
    .attr('viewBox', `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`)
    .attr('preserveAspectRatio', 'none')

  // Add Title and Subtitle
  const chartTitle = svg.append('g')
    .attr('transform', `translate(${VIEWBOX_WIDTH / 2} ${MARGIN.TOP / 2})`)
    chartTitle.append('text')
    .text(TITLE)
    .style('text-anchor', 'middle')
    .style('font-size', TITLE_FONT_SIZE)
    
  chartTitle.append('text')
    .text(SUBTITLE)
    .style('text-anchor', 'middle')
    .style('font-size', LABEL_FONT_SIZE)
    .attr('transform', `translate(0 30)`)
  
  // Add tooltip container
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  // Add month labels
  const monthTicks = svg.append('g')
    .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .text(d => MONTHS[d.month - 1])
    .attr('text-anchor', 'end')
    .attr('font-size', TICK_FONT_SIZE)
    .attr('transform', d => `translate(-5 ${(yScale(d.month)) + 20})`)
  
  svg.append('text')
    .text(Y_LABEL)
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${MARGIN.LEFT / 4} ${VIEWBOX_HEIGHT / 2}) rotate(-90)`)
    .style('font-size', LABEL_FONT_SIZE)

  // Add X axis
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(year => `${year}`)

  svg.append('g')
    .attr('transform', `translate(${MARGIN.LEFT}, ${VIEWBOX_HEIGHT - MARGIN.BOTTOM})`)
    .classed('x-axis', true)
    .call(xAxis)
    .selectAll('text')
    .attr('transform', 'translate(0 5)')
    .attr('font-size', TICK_FONT_SIZE)

  svg.append('text')
    .text(X_LABEL)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'hanging')
    .attr('transform', `translate(${VIEWBOX_WIDTH / 2} ${VIEWBOX_HEIGHT - (MARGIN.BOTTOM / 2)})`)
    .style('font-size', LABEL_FONT_SIZE)
  
  // Add <g> tags to act as anchors for data points
  const rects = svg.append('g')
    .attr('id', 'points')
    .attr('transform', `translate(${MARGIN.LEFT} ${MARGIN.TOP})`)
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => xScale(d.year))
    .attr('y', d => yScale(d.month))
    .attr('width', BAR_WIDTH)
    .attr('height', BAR_HEIGHT)
    .attr('fill', d => colorScale(d.temperature))
    .attr('stroke', d => colorScale(d.temperature))
    .on('mouseover', (d) => {
      tooltip.transition()
        .duration(150)
        .style('opacity', .9)
      tooltip.html(
        `<span>${MONTHS[d.month - 1]}, ${d.year}</span><br/>
        <span>Temp: ${d.temperature.toFixed(3)}°C</span><br/>
        <span>Variance: ${d.variance.toFixed(3)}</span>`
      )	
      .style('left', `${d3.event.pageX }px`)
      .style('top', `${d3.event.pageY - 100}px`)
    })
    .on('mouseout', function(d) {		
      tooltip.transition()		
          .duration(100)		
          .style('opacity', 0)
    })  

    const legend = svg.append('g')
      .attr('transform', `translate(${VIEWBOX_WIDTH - 400} ${VIEWBOX_HEIGHT - 50})`)
      .attr('class', 'legent')
      .selectAll('g')
      .data(legendColors)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(${i * 20} 0)`)

    legend.append('rect')
      .attr('height', 20)
      .attr('width', 20)
      .attr('fill', d => d)
    
    legend.append('text')
      .attr('dominant-baseline', 'hanging')
      .attr('transform', 'translate(2 20)')
      .attr('font-size', TICK_FONT_SIZE)
      .text((d, i) => i)
}


// load the dataset and render the plot
d3.json('global-temperature.json', (err, data) => {
    if (err) throw err

    const data_final = data.monthlyVariance.map(datum => ({
      ...datum,
      temperature: data.baseTemperature + datum.variance
    }))

    HeatMap(data_final)
  }
)
