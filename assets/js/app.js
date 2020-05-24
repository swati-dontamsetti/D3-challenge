// build chart
var svgWidth = 960
var svgHeight = 500

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
}

var width = svgWidth - margin.left - margin.right
var height = svgHeight - margin.top - margin.bottom

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`).classed("chart", true)

// Import data
d3.csv("assets/data/data.csv").then(function(data) {
    // Parse Data/Cast as numbers
    data.forEach(function(item) {
        item.age = +item.age
        item.healthcare = +item.healthcare
        item.obesity = +item.obesity
        item.poverty = +item.poverty
        item.smokes = +item.smokes
    })

    // Create scale functions
    var xScale = d3.scaleLinear()
        .domain([30, d3.max(data, d => d.age)])
        .range([0, width])
        .nice() //cleans up axis ticks
    
    var yScale = d3.scaleLinear()
        .domain([8, d3.max(data, d => d.smokes)])
        .range([height, 0])
        .nice()
    
    // Create axis functions
    var bottomAxis = d3.axisBottom(xScale)
    var leftAxis = d3.axisLeft(yScale)

    // Append axes to the chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)

    chartGroup.append("g")
      .call(leftAxis)

    // Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xScale(d.age))
        .attr("cy", d => yScale(d.smokes))
        .attr("r", "15")
    
    // Add state abbr to circles
    chartGroup.append("g")
        .selectAll('text')
        .data(data)
        .enter()
        .append("text")
        .classed("stateText", true)
        .text(d=>d.abbr)
        .attr("x", d=>xScale(d.age))
        .attr("y", d=>yScale(d.smokes))
        .attr("alignment-baseline", "central")

    // Initialize tool tip
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>Median Age: ${d.age}<br>Smokes: ${d.smokes}%`)
      })

    // Create tooltip in the chart
    chartGroup.call(toolTip)

    // Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function(circle) {
        toolTip.show(circle, this)
      })
        // onmouseout event
        .on("mouseout", function(circle, index) {
          toolTip.hide(circle, this);
        })

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "aText")
      .text("Smokes (%)")

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "aText")
      .text("Age (Median)")
})