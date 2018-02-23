function ForceDirectedGraph(data) {
  const WIDTH = 1000
  const HEIGHT = 1000
 
  const svg = d3
    .select('body')
    .append('div')
    .attr('class', 'container')
    .append('svg')
    .attr('height', HEIGHT)
    .attr('width', WIDTH)
  
 var simulation = d3
    .forceSimulation()
    .force("charge", d3.forceManyBody().strength(-100))
    .force("link", d3.forceLink())
    .force("x", d3.forceX(WIDTH / 2).strength(0.07))
    .force('y', d3.forceY(HEIGHT / 2).strength(0.07))

  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter().append("line")
    .attr('stroke', 'black')
    .attr("stroke-width", 1)

  var node = d3
    .select('.container')
    .append('div')
    .attr('class', 'flag-container')
    .selectAll("img")
    .data(data.nodes)
    .enter().append("img")
    .attr('class', (d) => `flag flag-${d.code}`)
    .on('mouseover', mouseOver)
    .on('mouseout', mouseOut)
    .call(d3.drag()
      .on('start', dragStart)
      .on('drag', drag)
      .on('end', dragEnd))

  simulation
    .nodes(data.nodes)
    .on("tick", () => requestAnimationFrame(ticked))

  simulation
    .force('link')
    .links(data.links)
    .distance(60)
    
  // EVENT HANDLERS
  function ticked() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

    node
        .style("left", d => `${d.x - 10}px`)
        .style("top", d => `${d.y - 10}px`)
  }

  function mouseOver(d) {
    tooltip
      .transition()
      .duration(150)
      .style('opacity', .9)
    tooltip
      .html(`<p>${d.country}</p>`)	
      .style('left', `${d3.event.pageX - 50}px`)
      .style('top', `${d3.event.pageY - 100}px`)
  }

  function mouseOut(d) {		
    tooltip
      .transition()		
      .duration(100)		
      .style('opacity', 0)
  }

  function dragStart(d) {
    if (!d3.event.active) {
      simulation
        .alphaTarget(0.3)
        .restart()
    }
    d.fx = d.x
    d.fy = d.y
  }

  function drag(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }

  function dragEnd(d) {
    if (!d3.event.active) {
      simulation
        .alphaTarget(0)
    }
    d.fx = null
    d.fy = null
  }
} // end ForceDirectedGraph


// load the dataset and render the plot
d3.json('countries.json', (err, data) => {
    if (err) throw err

    requestAnimationFrame(() => ForceDirectedGraph(data))
  }
)

