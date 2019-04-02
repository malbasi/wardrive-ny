import * as d3 from 'd3'

// Set up margin/height/width

var margin = { top: 70, left: 50, right: 10, bottom: 20 }

var height = 250 - margin.top - margin.bottom

var width = 400 - margin.left - margin.right

var container = d3.select('#men-chart')

// Create your scales

var xPositionScale = d3
  .scaleLinear()
  .domain([1983, 2018])
  .range([0, width])

var yPositionScale = d3
  .scaleLinear()
  .domain([0, 60])
  .range([height, 0])

// Creating line functions

var lineMale = d3
  .line()
  .x(d => xPositionScale(+d.ReleaseYear)
  )
  .y(d => yPositionScale(+d['Actor 1 Age']))

var lineFemale = d3
  .line()
  .x(d =>
  // console.log(+d['Release Year'])
    xPositionScale(+d.ReleaseYear)
  )
  .y(d => yPositionScale(+d['Actor 2 Age']))

// read in data

d3.csv(require('./data/men.csv'))
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

function ready (datapoints) {
  console.log(datapoints)
  var nested = d3
    .nest()
    .key(d => d['Actor 1 Name'])
    .sortValues(function (a, b) { return ((+a.ReleaseYear - +b.ReleaseYear)) })
    .entries(datapoints)
    // .sort(function (a, b) { return d3.descending(a.values.ReleaseYear, b.values.ReleaseYear) })

  console.log('nested looks like', nested)

  // console.log('nested data looks like', nested)

  container
    .selectAll('.actor-svg')
    .data(nested)
    .enter()
    .append('svg')
    .attr('class', 'actor-svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function (d) {
      // console.log('d looks like', d)
      let svg = d3.select(this)

      // console.log('d.values looks like', d.values)

      svg
        .append('path')
        .datum(d.values)
        .attr('d', lineMale)
        .attr('stroke', '#3C5A6A')
        .attr('stroke-width', 2.5)
        .attr('fill', 'none')

      svg
        .append('path')
        .datum(d.values)
        .attr('d', lineFemale)
        .attr('stroke', '#BC5E21')
        .attr('stroke-width', 2.5)
        .attr('fill', 'none')

      svg
        .append('text')
        .text(d.key)
        .attr('x', width / 2)
        .attr('y', 0)
        .attr('font-size', 14)
        .attr('text-anchor', 'middle')
        // .attr("font-weight", 'bold')
        // .attr('fill', '#3C5A6A')

      // console.log(d.values)

      var xAxis = d3.axisBottom(xPositionScale).tickValues([1985, 1995, 2005, 2015]).tickFormat(d3.format('d'))
      svg
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

      var yAxis = d3.axisLeft(yPositionScale).ticks(4)
      svg
        .append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis)
    })
}
