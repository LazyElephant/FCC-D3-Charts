/*Objective: Build a CodePen.io app that is functionally similar to this: https://codepen.io/FreeCodeCamp/full/ONxvaa/.

Fulfill the below user stories. Use whichever libraries or APIs you need. Give it your own personal style.

User Story: I can see performance time visualized in a scatterplot graph.

User Story: I can mouse over a plot to see a tooltip with additional details.

Hint: Here's a dataset you can use to build this: https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json

Remember to use Read-Search-Ask if you get stuck.

When you are finished, click the "I've completed this challenge" button and include a link to your CodePen.

You can get feedback on your project by sharing it with your friends on Facebook.*/

function ScatterPlot(data, options) {
  // define useful constants
  const VIEWBOX_WIDTH = 1000
  const VIEWBOX_HEIGHT = 600
  const MARGIN = {
      LEFT: 100,
      RIGHT: 100,
      TOP: 100,
      BOTTOM: 100,
    }
  const CHART_WIDTH = VIEWBOX_WIDTH - MARGIN.LEFT - MARGIN.RIGHT
  const CHART_HEIGHT = VIEWBOX_HEIGHT - MARGIN.TOP - MARGIN.BOTTOM
  const NUM_SAMPLES = data.length
  const LABEL_FONT_SIZE = '25px'
  const TITLE_FONT_SIZE = '40px'
  const TICK_FONT_SIZE = '16px'

  const svg = d3.select('body')
    .append('div')
      .attr('class', 'container')
    .append('svg')
      .attr('height', '100%')
      .attr('width', '100%')
      .attr('viewBox', `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`)
      .attr('preserveAspectRatio', 'none')

  // Add Title and Subtitle
  if (options.title) {
    const chartTitle = svg.append('g')
      .attr('transform', `translate(${VIEWBOX_WIDTH / 2} ${MARGIN.TOP / 2})`)
      chartTitle.append('text')
      .text(options.title)
      .style('text-anchor', 'middle')
      .style('font-size', TITLE_FONT_SIZE)
      
    if (options.subtitle) {
      chartTitle.append('text')
        .text(options.subtitle)
        .style('text-anchor', 'middle')
        .style('font-size', LABEL_FONT_SIZE)
        .attr('transform', `translate(0 40)`)
        
    }
  }
  
  // Add tooltip container
  const tooltip = d3.select('body')
    .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)

  // Add Y Axis
  const scaleY = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Place) + 2])
    .range([0, CHART_HEIGHT])
  const yAxis = d3.axisLeft(scaleY)

  svg.append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
      .classed('y-axis', true)
    .call(yAxis)
    .selectAll('text')
      .attr('transform', 'translate(-5 0)')
      .attr('font-size', TICK_FONT_SIZE)
  
  if (options.labelY) {
    svg.append('text')
      .text(options.labelY)
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${MARGIN.LEFT / 2} ${VIEWBOX_HEIGHT / 2}) rotate(-90)`)
      .style('font-size', LABEL_FONT_SIZE)
  }

  // Add X axis
  const scaleX = d3.scaleLinear()
    .domain([d3.max(data, d => d.Seconds) + 40, 0])
    .range([0, CHART_WIDTH])
  const xAxis = d3.axisBottom(scaleX)
  xAxis.tickFormat( seconds => `${Math.floor(seconds/60)}:${seconds%60}`)

  svg.append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${VIEWBOX_HEIGHT - MARGIN.BOTTOM})`)
      .classed('x-axis', true)
    .call(xAxis)
    .selectAll('text')
      .attr('transform', 'translate(0 5)')
      .attr('font-size', TICK_FONT_SIZE)

  if (options.labelX) {
    svg.append('text')
      .text(options.labelX)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('transform', `translate(${VIEWBOX_WIDTH / 2} ${VIEWBOX_HEIGHT - (MARGIN.BOTTOM / 2)})`)
      .style('font-size', LABEL_FONT_SIZE)
  }

  // Add <g> tags to act as anchors for data points
  const points = svg.append('g')
      .attr('id', 'points')
      .attr('transform', `translate(${MARGIN.LEFT} ${MARGIN.TOP})`)
    .selectAll('g')
    .data(data)
    .enter()
      .append('g')
        .attr('transform', d => `translate(${scaleX(d.Seconds)} ${scaleY(d.Place)})`)
        .on('mouseover', (d) => {
          tooltip.transition()
            .duration(150)
            .style('opacity', .9)
          tooltip.html(
            `<span>${d.Name}: ${d.Nationality}</span><br/>
            <span>Year: ${d.Year}</span>
            <span>Time: ${d.Time}</span><br/><br/>
            <span>${d.Doping}</span>`
          )	
          .style('left', `${d3.event.pageX - 200}px`)
          .style('top', `${d3.event.pageY - 50}px`)
        })
        .on('mouseout', function(d) {		
          tooltip.transition()		
              .duration(100)		
              .style('opacity', 0)
        })
        
  points.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 5)
    .attr('fill', d => d.Doping ? 'black' : 'white')       
  points.append('text')
    .attr('transform', 'translate(15 4)')
    .text(d => d.Name)
    .attr('font-size', '12px')
    
}


// load the dataset and render the plot
d3.json('static/data/cyclist-data.json', (err, data) => {
    if (err) {
      console.error("Error loading the data")
      return
    }

    const data_final = data.map(d => ({
      ...d,
      Seconds: d.Seconds - data[0].Seconds
    }))
    requestAnimationFrame(() => ScatterPlot(data_final, {
      title:'Doping in Professional Bicycle Racing',
      subtitle: "Top 35 times up Alpe d'Huez",
      labelY: 'Place',
      labelX: 'Minutes Behind Fastest Time',
    }))
  }
)
