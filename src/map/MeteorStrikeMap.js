// load the dataset and render the plot
(async function() {
  const [ meteoriteData, mapData ] = await Promise.all([
    fetch('meteorite-strikes.json').then(r => r.json()),
    fetch('world-map.json').then(r => r.json()),
  ])

  meteoriteData.features = meteoriteData.features.sort((a, b) => +b.properties.mass - +a.properties.mass)

  const WIDTH = 1000
  const HEIGHT = 500

  const svg = d3.select('body')
    .append('div')
    .attr('class', 'container')
    .append('svg')
    .attr('height', '100%')
    .attr('width', '100%')
    .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
  
  // Add tooltip container
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  const projection = d3
    .geoNaturalEarth1()
    .translate([WIDTH / 2, HEIGHT / 2])
    .scale(180)

  const path = d3.geoPath(projection)

  const mapContainer = svg
    .append('g')
    .attr('id', 'map')

  const countries = mapContainer
    .selectAll('path')
    .data(topojson.feature(mapData, mapData.objects.countries).features)
    .enter()
    .append('path')
    .attr('fill', 'darkslategrey')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('d', path)

  const domainMax = Math
    .log(d3
      .max(meteoriteData.features, d => +d.properties.mass))

  const sizeScale = d3
    .scaleQuantize()
    .domain([0, domainMax])
    .range([0.3, 0.4, 0.5, 0.6, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7,  2.3, 3, 3.7, 4.4, 10, 16])

  const colorScale = d3
    .scaleSequential(d3.interpolateRainbow)
    .domain([0, domainMax])

  const meteorites = mapContainer
    .selectAll('circle')
    .data(meteoriteData.features)
    .enter()
    .append('circle')
    .attr('cx', d => projection([d.properties.reclong, d.properties.reclat])[0])
    .attr('cy', d => projection([d.properties.reclong, d.properties.reclat])[1])
    .attr('r', d => sizeScale(Math.log(d.properties.mass)))
    .attr('fill', d => colorScale(Math.log(d.properties.mass)))
    .attr('opacity', 0.8)
    .attr('stroke', 'black')
    .attr('stroke-width', 0.4)
    .on('mouseover', mouseOver)
    .on('mouseout', mouseOut)
  
  
  const zoom = d3.zoom()
    .scaleExtent([1.0, 10.0])
    .translateExtent([[0, 0], [WIDTH, HEIGHT]])
    .on('zoom', onZoom)
    
  svg.call(zoom)

  function onZoom() {
    const { x, y, k } = d3.event.transform

    mapContainer
      .attr('transform', `translate(${x} ${y}) scale(${k})`)
  }

  function mouseOver(d) {
    const { mass, name, year, id } = d.properties
    tooltip
      .transition()
      .duration(150)
      .style('opacity', .9)
    tooltip
      .html(`
      <span>ID: ${id}</span><br/>
      <span>Name: ${name}</span><br/>
      <span>Mass: ${mass}</span><br/>
      <span>Date: ${year.split('T')[0]}</span><br/>
      `)	
      .style('left', `${d3.event.pageX - 50}px`)
      .style('top', `${d3.event.pageY - 100}px`)
  }

  function mouseOut(d) {		
    tooltip
      .transition()		
      .duration(100)		
      .style('opacity', 0)
  }
})()