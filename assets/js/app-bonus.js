// build chart
var svgWidth = 960
var svgHeight = 500

var margin = {
  top: 20,
  right: 40,
  bottom: 85,
  left: 100
}

var width = svgWidth - margin.left - margin.right
var height = svgHeight - margin.top - margin.bottom

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight)

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)


var currentX = "age"
var currentY = "smokes"

// Create scale functions
function xScale(data, currentX) {
  var xLinearScale = d3.scaleLinear()
    .domain([
      d3.min(data, d => d[currentX] * 0.95),
      d3.max(data, d => d[currentX])])
    .range([0, width])
    .nice()

  return xLinearScale  
}

function yScale(data, currentY) {
  var yLinearScale = d3.scaleLinear()
    .domain([
      d3.min(data, d => d[currentY] * 0.85),
      d3.max(data, d => d[currentY])])
    .range([height, 0])
    .nice()

  return yLinearScale
}

// Import data
function getData() {
  d3.csv("assets/data/data.csv").then(function(data) {
    // Parse Data/Cast as numbers
    data.forEach(function(item) {
        item.age = +item.age
        item.healthcare = +item.healthcare
        item.income = +item.income
        item.obesity = +item.obesity
        item.poverty = +item.poverty
        item.smokes = +item.smokes
    })
    
    // get x and y scales from functions
    var xLinearScale = xScale(data, currentX)
    var yLinearScale = yScale(data, currentY)

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale)
    var leftAxis = d3.axisLeft(yLinearScale)

    // Append axes to the chart
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)

    var yAxis = chartGroup.append("g")
      .call(leftAxis)

    // create base layer to add onto
    var controlGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("g")

    // Create Circles
    var circlesGroup = controlGroup.append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[currentX]))
        .attr("cy", d => yLinearScale(d[currentY]))
        .attr("r", "15")
    
    // Add state abbr to circles
    var textGroup = controlGroup.append("text")
        .classed("stateText", true)
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[currentX]))
        .attr("y", d => yLinearScale(d[currentY]))
        .attr("alignment-baseline", "central")

    // Create axes labels
    var xAxisLabel = chartGroup.append("g")
      .attr("transform", `translate(${width/2}, ${height + 20 + margin.top})`)
      .attr("class", "aText")

    var yAxisLabel = chartGroup.append("g")
      .attr('transform', `translate(${0 - margin.left / 4}, ${height / 2})`)
      .attr("class", "aText")

    var ageLabel = xAxisLabel.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("value", "age")
      .classed("active", true)
      .classed("aText", true)
      .text("Age (Median)")
    
    var povertyLabel = xAxisLabel.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("inactive", true)
      .classed("aText", true)
      .text("In Poverty (%)")

    var incomeLabel = xAxisLabel.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "income")
      .classed("inactive", true)
      .classed("aText", true)
      .text("Household Income (Median)")

    var smokesLabel = yAxisLabel.append("text")
      .attr('y', 0 - 20)
      .attr('x', 0)
      .attr('transform', 'rotate(-90)')
      .attr('dy', '1em')
      .attr("value", "smokes")
      .classed("active", true)
      .classed("aText", true)
      .text("Smokes (%)")

    var healthcareLabel = yAxisLabel.append("text")
      .attr('y', 0 - 40)
      .attr('x', 0)
      .attr('transform', 'rotate(-90)')
      .attr('dy', '1em')
      .attr("value", "healthcare")
      .classed("inactive", true)
      .classed("aText", true)
      .text("Lacks Healthcare (%)")

    var obesityLabel = yAxisLabel.append("text")
      .attr('y', 0 - 60)
      .attr('x', 0)
      .attr('transform', 'rotate(-90)')
      .attr('dy', '1em')
      .attr("value", "obesity")
      .classed("inactive", true)
      .classed("aText", true)
      .text("Obese (%)")
    
    // tool tip for base chart
    circlesGroup = updateToolTip(currentX, currentY, circlesGroup)
    
    // x axis event listener
    xAxisLabel.selectAll("text")
      .on("click", function() {
        // get value
        var value = d3.select(this).attr("value")
        if (value !== currentX) {
          // replace currentX with value
          currentX = value

          // update x scale
          xLinearScale = xScale(data, currentX)

          // updates axis with transition
          xAxis = transitionXAxis(xLinearScale, xAxis)

          // updates circles
          circlesGroup = updateCircles(circlesGroup,
                                       xLinearScale,
                                       yLinearScale,
                                       currentX,
                                       currentY)

          // updates text
          textGroup = updateText(textGroup,
                                 xLinearScale,
                                 yLinearScale,
                                 currentX,
                                 currentY)
            
          // changes class from active to inactive
          if (currentX === 'poverty') {
            povertyLabel.classed('active', true).classed('inactive', false)
            ageLabel.classed('active', false).classed('inactive', true)
            incomeLabel.classed('active', false).classed('inactive', true)
          } else if (currentX === 'age') {
            povertyLabel.classed('active', false).classed('inactive', true)
            ageLabel.classed('active', true).classed('inactive', false)
            incomeLabel.classed('active', false).classed('inactive', true)
          } else {
            povertyLabel.classed('active', false).classed('inactive', true)
            ageLabel.classed('active', false).classed('inactive', true)
            incomeLabel.classed('active', true).classed('inactive', false)
          }

          // update tooltip
          circlesGroup = updateToolTip(currentX, currentY, circlesGroup)
        }
      })

      // y axis event listener
      yAxisLabel.selectAll("text")
        .on("click", function(){
          // get value
          var value = d3.select(this).attr("value")
          if (value !== currentY) {
            currentY = value

            // update y scale
            yLinearScale = yScale(data, currentY)

            // updates axis transition
            yAxis = transitionYAxis(yLinearScale, yAxis)

            // updates circles
            circlesGroup = updateCircles(circlesGroup,
                                         xLinearScale,
                                         yLinearScale,
                                         currentX,
                                         currentY)

            // update text
            textGroup = updateText(textGroup,
                                   xLinearScale,
                                   yLinearScale,
                                   currentX,
                                   currentY)

            // changes class from active to inactive
            if (currentY === 'healthcare') {
              healthcareLabel.classed('active', true).classed('inactive', false)
              smokesLabel.classed('active', false).classed('inactive', true)
              obesityLabel.classed('active', false).classed('inactive', true)
            } else if (currentY === 'smokes') {
              healthcareLabel.classed('active', false).classed('inactive', true)
              smokesLabel.classed('active', true).classed('inactive', false)
              obesityLabel.classed('active', false).classed('inactive', true)
            } else {
              healthcareLabel.classed('active', false).classed('inactive', true)
              smokesLabel.classed('active', false).classed('inactive', true)
              obesityLabel.classed('active', true).classed('inactive', false)
            }

            // update tooltip
            circlesGroup = updateToolTip(currentX, currentY, circlesGroup)
          }
        })
})}

// transition axes functions
function transitionXAxis(xLinearScale, xAxis) {
  var bottomAxis = d3.axisBottom(xLinearScale)

  xAxis.transition().duration(100).call(bottomAxis)

  return xAxis
}

function transitionYAxis(yLinearScale, yAxis) {
  var leftAxis = d3.axisLeft(yLinearScale)

  yAxis.transition().duration(100).call(leftAxis)

  return yAxis
}

// update circle groups
function updateCircles(circlesGroup, xLinearScale, yLinearScale, currentX, currentY) {
  circlesGroup.transition().duration(100)
    .attr("cx", d => xLinearScale(d[currentX]))
    .attr("cy", d => yLinearScale(d[currentY]))
    .attr("r", "15")
  
  return circlesGroup
}

// update text
function updateText(textGroup, xLinearScale, yLinearScale, currentX, currentY) {
  textGroup.transition().duration(100)
    .attr("x", d => xLinearScale(d[currentX]))
    .attr("y", d => yLinearScale(d[currentY]))
    .attr("alignment-baseline", "central")

  return textGroup
}

function updateToolTip(currentX, currentY, circlesGroup){
  var xLabel = ""
  var yLabel = ""

  if (currentX === "poverty") {
    xLabel = "Poverty: "
  } else if (currentX === 'age') {
    xLabel = 'Age: '
  } else {
    xLabel = 'Income: $'
  }
  if (currentY === 'healthcare') {
    yLabel = 'Lack Care: '
  } else if (currentY === 'smokes') {
    yLabel = 'Smokes: '
  } else {
    yLabel = 'Obesity: '
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      if (currentY === 'smokes' || currentY === 'obesity') {
        if (currentX === 'poverty') {
          return `${d.state}<br>${xLabel}${d[currentX]}%<br>${yLabel}${d[currentY]}%`
        }
        return `${d.state}<br>${xLabel}${d[currentX]}<br>${yLabel}${d[currentY]}%`
      } else if (currentX === 'poverty') {
        return `${d.state}<br>${xLabel}${d[currentX]}%<br>${yLabel}${d[currentY]}%`
      } else {
        return `${d.state}<br>${xLabel}${d[currentX]}<br>${yLabel}${d[currentY]}%`
      }
    })

    chartGroup.call(toolTip)

    circlesGroup.on("mouseover", function(circle) {
      toolTip.show(circle, this)
    }).on("mouseout", function(circle, index) {
      toolTip.hide(circle, this)
    })

    return circlesGroup
}

getData()