import * as d3 from 'd3'
// import { debounce } from 'debounce'

const margin = {
  top: 30,
  right: 20,
  bottom: 30,
  left: 190
}

const width = 700 - margin.left - margin.right
const height = 650 - margin.top - margin.bottom

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var defs = svg.append('defs')

const colorScale = d3
  .scaleOrdinal()
  .range([
    '#4b1803',
    '#726737',
    '#d9a746',
    '#bb5e22',
    '#739aa6'
  ])

var xPositionScale = d3.scaleLinear()
  .range([0, width])
  .domain([15, 70])

var yPositionScale = d3
  .scalePoint()
  .range([height - 50, 180])

var xPostion = d3.scalePoint()
  .range([0, width])

var div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)

d3.csv(require('./data/top_directors_withimg2.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready (datapoints) {
  // // set color scale domain
  // var directorName = datapoints.map(d => d['Director'])
  // colorScale.domain(directorName)

  // // set yPositionScale domain
  // var movieName = datapoints.map(d => d['Movie Name'])
  // yPositionScale.domain(movieName)

  var nested = d3
    .nest()
    .key(d => d.Director)
    .entries(datapoints)

  // sort nested data
  nested.sort(function (b, a) {
    return b.values.length - a.values.length
  })

  var names = nested.map(d => d.key)
  // console.log(names)
  xPostion.domain(names)

  // add director's images to circles
  defs.selectAll('.director-pattern')
    .data(datapoints)
    .enter().append('pattern')
    .attr('class', 'director-pattern')
    .attr('id', function (d) {
      return d.Director.toLowerCase().replace(' ', '')
    })
    .attr('height', '100%')
    .attr('width', '100%')
    .attr('patternContentUnits', 'objectBoundingBox')
    .append('image')
    .attr('height', '1')
    .attr('width', '1')
    .attr('preserveAspectRatio', 'none')
    .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    .attr('xlink:href', function (d) {
      return d.image_path
    })

  // add label group for directors
  let labelGroup = svg.append('g').attr('id', 'label').attr('transform', 'translate(-30, 0)')

  // add director images
  labelGroup
    .selectAll('.label-circle')
    .data(nested)
    .enter()
    .append('circle')
    .attr('r', 40)
    .attr('cx', d => xPostion(d.key))
    .attr('cy', 20)
    .attr('fill', function (d) {
      return 'url(#' + d.key.toLowerCase().replace(/ /g, '') + ')'
    })
    .attr('class', d => {
      return d.key.toLowerCase().replace(' ', '')
    })
    .classed('labels', true)
    .attr('opacity', 0.9)
    .style('pointer-events', 'none')

  // add directors name under image
  labelGroup
    .selectAll('.label-text')
    .data(nested)
    .enter()
    .append('text')
    .text(d => d.key)
    .attr('font-size', 14)
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .attr('opacity', 0.9)
    .attr('fill', d => colorScale(d.key))
    .attr('y', 80)
    .classed('labels-text', true)
    .attr('x', d => xPostion(d.key))
    .attr('class', d => {
      return 'text' + d.key.toLowerCase().replace(' ', '')
    })
    .classed('labels-text', true)

  // // draw the average line and hide it
  // // place line for 18 y.o.
  // svg
  //   .append('line')
  //   .attr('x1', 50)
  //   .attr('y1', 100)
  //   .attr('x2', 50)
  //   .attr('y2', height)
  //   .attr('stroke-dasharray', ('3,5'))
  //   .attr('stroke-width', 2)
  //   .attr('stroke', 'red')
  //   .attr('class', 'average-line')
  //   .attr('opacity', 0.5)
  //   .lower()
  //   .style('visibility', 'hidden')

  // var xAxis = d3.axisBottom(xPositionScale)
  // svg
  //   .append('g')
  //   .transition()
  //   .attr('class', 'axis x-axis')
  //   .attr('transform', 'translate(0,' + height + ')')
  //   .call(xAxis)
  //   .style('visibility', 'hidden')

  /* Set up axes */
  var xAxis = d3.axisBottom(xPositionScale)
  svg
    .append('g')
    .transition()
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .style('visibility', 'hidden')

  var yAxis = d3.axisLeft(yPositionScale).tickSize(0)

  svg
    .append('g')
    .transition()
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .style('visibility', 'hidden')

  // svg.selectAll('.y-axis path')

  // filter the datapoints for each director
  let dir1Datapoints = datapoints.filter(d => d.Director === 'Woody Allen')
  let dir2Datapoints = datapoints.filter(d => d.Director === 'John Glen')
  let dir3Datapoints = datapoints.filter(d => d.Director === 'Lewis Gilbert')
  let dir4Datapoints = datapoints.filter(d => d.Director === 'Joel Coen')
  let dir5Datapoints = datapoints.filter(d => d.Director === 'Jonathan Lynn')

  // Scrollytelling!
  // for each director, update the y-axis and redraw the barbells
  // d3.select('#top3').on('stepin', () => {
  //   svg.selectAll('#act1').remove()
  //   svg.selectAll('#act2').remove()
  //   svg.selectAll('#bar').remove()
  //   svg.selectAll('.y-axis').remove()
  //   svg.selectAll('.average-line').style('visibility', 'hidden')
  //   svg.selectAll('.x-axis').style('visibility', 'hidden')
  //   svg.selectAll('.labels').attr('opacity', 0.9).attr('fill', function (d) {
  //     return 'url(#' + d.key.toLowerCase().replace(/ /g, '') + ')'
  //   })
  //   svg.selectAll('.labels-text').attr('opacity', 0.9).attr('fill', d => colorScale(d.key))

  //   /* Set up axes */
  //   svg.selectAll('.x-axis')
  //     .attr('transform', 'translate(0,' + height + ')')
  //     .call(xAxis)
  //     .style('visibility', 'hidden')

  //   var yAxis = d3.axisLeft(yPositionScale).tickSize(0)
  //   svg.selectAll('.y-axis')
  //     .call(yAxis)
  //     .style('visibility', 'visible')

  //   // svg.selectAll('.x-axis path').attr('stroke', 'none')

  //   svg.selectAll('.domain').remove()
  // })

  d3.select('#director5').on('stepin', () => {
    // reset the yAxis domain with new movie names
    var dir5MovieName = dir5Datapoints.map(d => d['Movie Name'])
    yPositionScale.domain(dir5MovieName).range([(height - 45) / 2, 180])

    // remove circles and axis from previous director
    svg.selectAll('#act1').remove()
    svg.selectAll('#act2').remove()
    svg.selectAll('#bar').remove()
    svg.selectAll('.y-axis').remove()
    svg.selectAll('.x-axis').remove()

    // call the new xAxis
    svg
      .append('g')
      .transition()
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0, ' + (height - 12) / 2 + ')')
      .call(xAxis)

    var yAxis = d3.axisLeft(yPositionScale)
    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis)
    svg.selectAll('.y-axis path').attr('stroke', 'none')

    svg.selectAll('.domain').remove()

    // console.log(xPostion.domain())
    // place circles for actor1
    svg
      .selectAll('.act1')
      .data(dir5Datapoints)
      .enter()
      .append('circle')
      .attr('class', d => {
        return 'dif' + d['dif'] + d['Release Year'] + ' ' + d['Actor 1 Gender']
      })
      .attr('id', 'act1')
      .attr('cx', d => xPostion(d.Director) - 25)
      .attr('cy', 25)
      .transition()
      .attr('cx', d => {
        var age = +d['Actor 1 Age']
        return xPositionScale(age)
      })
      .attr('cy', d => {
        return yPositionScale(d['Movie Name'])
      })
      .attr('r', 6)
      .attr('fill', d => colorScale(d.Director))

    // place circles for actor 2
    svg.selectAll('.act2')
      .data(dir5Datapoints)
      .enter()
      .append('circle')
      .attr('class', d => {
        return 'dif' + d['dif'] + d['Release Year'] + ' ' + d['Actor 2 Gender']
      })
      .attr('id', 'act2')
      .attr('cx', d => xPostion(d.Director) - 25)
      .attr('cy', 25)
      .transition()
      .attr('cx', d => {
        var age = +d['Actor 2 Age']
        return xPositionScale(age)
      })
      .attr('cy', d => {
        return yPositionScale(d['Movie Name'])
      })
      .attr('r', 6)
      .attr('fill', d => colorScale(d.Director))

    // draw the connecting line
    svg.selectAll('.bar')
      .data(dir5Datapoints)
      .enter()
      .append('line')
      .attr('class', d => 'dif' + d['dif'] + d['Release Year'])
      .attr('id', 'bar')
      .attr('x1', d => xPostion(d.Director) - 25)
      .attr('x2', d => xPostion(d.Director) - 25)
      .attr('y1', 25)
      .attr('y2', 25)
      .transition()
      .attr('x1', d => {
        return xPositionScale(+d['Actor 1 Age'])
      })
      .attr('y1', d => yPositionScale(d['Movie Name']))
      .attr('x2', d => xPositionScale(+d['Actor 2 Age']))
      .attr('y2', d => yPositionScale(d['Movie Name']))
      .attr('stroke-width', 1)
      .attr('stroke', d => colorScale(d.Director))
      .attr('opacity', 0.5)

    //* MOUSEOVER PART *//
    svg.selectAll('circle')
      .on('mouseover', function (d) {
        // console.log(d)
        var className = 'dif' + d['dif'] + d['Release Year']
        d3.select('circle.' + className)
          .raise()
          .transition()
          .attr('r', 10)
          .attr('stroke-width', 1)
          .attr('fill', '#3C5A6A')

        d3.select('circle.' + className)
          .raise()
          .transition()
          .attr('r', 10)
          .attr('stroke-width', 1)
          .attr('fill', '#BC5E21')

        d3.selectAll('line.' + className)
          .transition()
          .attr('stroke-width', '3')

        div.transition().style('opacity', 0.9)

        div
          .html(d['Actor 2 Name'] + ': ' + d['Actor 2 Age'] + '<br/>' + d['Actor 1 Name'] + ': ' + d['Actor 1 Age'] +
            '<br/>' +
            'Release Year: ' + d['Release Year']
          )
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px')
      })
      .on('mouseout', function (d, i) {
        // var className = d['Movie Name'].toLowerCase().replace(/\s+/g,'')
        var className = 'dif' + d['dif'] + d['Release Year']
        var act1Name = d['Actor 1 Name'].toLowerCase().replace(/\s+/g, '')
        var act2Name = d['Actor 2 Name'].toLowerCase().replace(/\s+/g, '')
        div.transition().style('opacity', 0)

        d3.selectAll('circle.' + className)
          .transition()
          .attr('stroke', 'none')
          .attr('r', 6)
          .attr('stroke-width', 0)
          .attr('fill', d => colorScale(d.Director))

        d3.selectAll('line.' + className)
          .transition()
          .attr('stroke-width', '1')
      })

    svg.selectAll('.labels').transition().attr('opacity', 0.2)
    // .attr('fill', function (d) {
    // console.log(d.key.toLowerCase().replace(/ /g, ''))
    // return 'url(#' + d.key.toLowerCase().replace(/ /g, '') + ')'
    // })
    svg.selectAll('.jonathanlynn')
      .transition()
      .attr('opacity', 0.9)

    svg.selectAll('.labels-text').transition().attr('opacity', 0.2).attr('fill', d => colorScale(d.key))
    svg.selectAll('.textjonathanlynn')
      .transition()
      .attr('opacity', 0.9)
  })

  d3.select('#director4').on('stepin', () => {
    var dir4MovieName = dir4Datapoints.map(d => d['Movie Name'])
    yPositionScale.domain(dir4MovieName).range([(height - 80) / 1.5, 180])
    svg.selectAll('#act1').remove()
    svg.selectAll('#act2').remove()
    svg.selectAll('#bar').remove()
    svg.selectAll('.y-axis').remove()
    svg.selectAll('.x-axis').remove()
    svg
      .append('g')
      .transition()
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0, ' + (height - 50) / 1.5 + ')')
      .call(xAxis)

    svg.selectAll('.domain').remove()
    svg
      .selectAll('.act1')
      .data(dir4Datapoints)
      .enter()
      .append('circle')
      .attr('class', d => {
        return 'dif' + d['dif'] + d['Release Year'] + ' ' + d['Actor 1 Gender']
      })
      .attr('id', 'act1')
      .attr('cx', d => xPostion(d.Director) - 25)
      .attr('cy', 25)
      .transition()
      .attr('cx', d => {
        var age = +d['Actor 1 Age']
        return xPositionScale(age)
      })
      .attr('cy', d => {
        return yPositionScale(d['Movie Name'])
      })
      .attr('r', 6)
      .attr('fill', d => colorScale(d.Director))

    svg.selectAll('.act2')
      .data(dir4Datapoints)
      .enter()
      .append('circle')
      .attr('class', d => {
        return 'dif' + d['dif'] + d['Release Year'] + ' ' + d['Actor 2 Gender']
      })
      .attr('id', 'act2')
      .attr('cx', d => xPostion(d.Director) - 25)
      .attr('cy', 25)
      .transition()
      .attr('cx', d => {
        var age = +d['Actor 2 Age']
        return xPositionScale(age)
      })
      .attr('cy', d => {
        return yPositionScale(d['Movie Name'])
      })
      .attr('r', 6)
      .attr('fill', d => colorScale(d.Director))

    svg.selectAll('.bar')
      .data(dir4Datapoints)
      .enter()
      .append('line')
      .attr('class', d => 'dif' + d['dif'] + d['Release Year'])
      .attr('id', 'bar')
      .attr('x1', d => xPostion(d.Director) - 25)
      .attr('x2', d => xPostion(d.Director) - 25)
      .attr('y1', 25)
      .attr('y2', 25)
      .transition()
      .attr('x1', d => {
        return xPositionScale(+d['Actor 1 Age'])
      })
      .attr('y1', d => yPositionScale(d['Movie Name']))
      .attr('x2', d => xPositionScale(+d['Actor 2 Age']))
      .attr('y2', d => yPositionScale(d['Movie Name']))
      .attr('stroke-width', 1)
      .attr('stroke', d => colorScale(d.Director))
      .attr('opacity', 0.5)

    //* MOUSEOVER PART *//
    svg.selectAll('circle')
      .on('mouseover', function (d) {
        var className = 'dif' + d['dif'] + d['Release Year']
        d3.select('circle.' + className)
          .raise()
          .transition()
          .attr('r', 10)
          .attr('stroke-width', 1)
          .attr('fill', '#3C5A6A')

        d3.select('circle.' + className)
          .raise()
          .transition()
          .attr('r', 10)
          .attr('stroke-width', 1)
          .attr('fill', '#BC5E21')

        d3.selectAll('line.' + className)
          .transition()
          .attr('stroke-width', '3')

        // div.transition().style('opacity', 0.9)

        div
          .html(d['Actor 2 Name'] + ': ' + d['Actor 2 Age'] + '<br/>' + d['Actor 1 Name'] + ': ' + d['Actor 1 Age'] +
            '<br/>' +
            'Release Year: ' + d['Release Year']
          )
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px')
      })
      .on('mouseout', function (d, i) {
        // var className = d['Movie Name'].toLowerCase().replace(/\s+/g,'')
        var className = 'dif' + d['dif'] + d['Release Year']
        div.transition().style('opacity', 0)

        d3.selectAll('circle.' + className)
          .transition()
          .attr('stroke', 'none')
          .attr('r', 6)
          .attr('stroke-width', 0)
          .attr('fill', d => colorScale(d.Director))

        d3.selectAll('line.' + className)
          .transition()
          .attr('stroke-width', '1')
      })

    svg.selectAll('.labels').transition().attr('opacity', 0.2)
    // .attr('fill', function (d) {
    //   // console.log(d.key.toLowerCase().replace(/ /g, ''))
    //   return 'url(#' + d.key.toLowerCase().replace(/ /g, '') + ')'
    // })
    svg.selectAll('.joelcoen')
      .transition()
      .attr('opacity', 0.9)

    svg.selectAll('.labels-text').transition().attr('opacity', 0.2)
    // .attr('fill', d => colorScale(d.key))
    svg.selectAll('.textjoelcoen')
      .transition()
      .attr('opacity', 0.9)

    var yAxis = d3.axisLeft(yPositionScale)
    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis)

    svg.selectAll('.y-axis path').attr('stroke', 'none')
  })

  d3.select('#director3').on('stepin', () => {
    var dir3MovieName = dir3Datapoints.map(d => d['Movie Name'])
    yPositionScale.domain(dir3MovieName).range([(height - 50) / 2, 180])
    svg.selectAll('#act1').remove()
    svg.selectAll('#act2').remove()
    svg.selectAll('#bar').remove()
    svg.selectAll('.y-axis').remove()
    svg.selectAll('.x-axis').remove()

    svg
      .append('g')
      .transition()
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0, ' + (height - 12) / 2 + ')')
      .call(xAxis)

    svg.selectAll('.domain').remove()
    svg
      .selectAll('.act1')
      .data(dir3Datapoints)
      .enter()
      .append('circle')
      .attr('class', d => {
        return 'dif' + d['dif'] + d['Release Year'] + ' ' + d['Actor 1 Gender']
      })
      .attr('id', 'act1')
      .attr('cx', d => xPostion(d.Director) - 25)
      .attr('cy', 25)
      .transition()
      .attr('cx', d => {
        var age = +d['Actor 1 Age']
        return xPositionScale(age)
      })
      .attr('cy', d => {
        return yPositionScale(d['Movie Name'])
      })
      .attr('r', 6)
      .attr('fill', d => colorScale(d.Director))

    svg.selectAll('.act2')
      .data(dir3Datapoints)
      .enter()
      .append('circle')
      .attr('class', d => {
        return 'dif' + d['dif'] + d['Release Year'] + ' ' + d['Actor 2 Gender']
      })
      .attr('id', 'act2')
      .attr('cx', d => xPostion(d.Director) - 25)
      .attr('cy', 25)
      .transition()
      .attr('cx', d => {
        var age = +d['Actor 2 Age']
        return xPositionScale(age)
      })
      .attr('cy', d => {
        return yPositionScale(d['Movie Name'])
      })
      .attr('r', 6)
      .attr('fill', d => colorScale(d.Director))

    svg.selectAll('.bar')
      .data(dir3Datapoints)
      .enter()
      .append('line')
      .attr('class', d => 'dif' + d['dif'] + d['Release Year'])
      .attr('id', 'bar')
      .attr('x1', d => xPostion(d.Director) - 25)
      .attr('x2', d => xPostion(d.Director) - 25)
      .attr('y1', 25)
      .attr('y2', 25)
      .transition()
      .attr('x1', d => {
        return xPositionScale(+d['Actor 1 Age'])
      })
      .attr('y1', d => yPositionScale(d['Movie Name']))
      .attr('x2', d => xPositionScale(+d['Actor 2 Age']))
      .attr('y2', d => yPositionScale(d['Movie Name']))
      .attr('stroke-width', 1)
      .attr('stroke', d => colorScale(d.Director))
      .attr('opacity', 0.5)

    //* MOUSEOVER PART *//
    svg.selectAll('circle')
      .on('mouseover', function (d) {
        var className = 'dif' + d['dif'] + d['Release Year']
        d3.select('circle.' + className)
          .raise()
          .transition()
          .attr('r', 10)
          .attr('stroke-width', 1)
          .attr('fill', '#3C5A6A')

        d3.select('circle.' + className)
          .raise()
          .transition()
          .attr('r', 10)
          .attr('stroke-width', 1)
          .attr('fill', '#BC5E21')

        d3.selectAll('line.' + className)
          .transition()
          .attr('stroke-width', '3')

        div.transition().style('opacity', 0.9)

        div
          .html(d['Actor 2 Name'] + ': ' + d['Actor 2 Age'] + '<br/>' + d['Actor 1 Name'] + ': ' + d['Actor 1 Age'] +
            '<br/>' +
            'Release Year: ' + d['Release Year']
          )
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px')
      })
      .on('mouseout', function (d, i) {
        // var className = d['Movie Name'].toLowerCase().replace(/\s+/g,'')
        var className = 'dif' + d['dif'] + d['Release Year']
        div.transition().style('opacity', 0)

        d3.selectAll('circle.' + className)
          .transition()
          .attr('stroke', 'none')
          .attr('r', 6)
          .attr('stroke-width', 0)
          .attr('fill', d => colorScale(d.Director))

        d3.selectAll('line.' + className)
          .transition()
          .attr('stroke-width', '1')
      })

    svg.selectAll('.labels').transition().attr('opacity', 0.2)
    // .attr('fill', function (d) {
    //   // console.log(d.key.toLowerCase().replace(/ /g, ''))
    //   return 'url(#' + d.key.toLowerCase().replace(/ /g, '') + ')'
    // })
    svg.selectAll('.lewisgilbert')
      .transition()
      .attr('opacity', 0.9)

    svg.selectAll('.labels-text').transition().attr('opacity', 0.2)
    // .attr('fill', d => colorScale(d.key))
    svg.selectAll('.textlewisgilbert')
      .transition()
      .attr('opacity', 0.9)

    var yAxis = d3.axisLeft(yPositionScale)
    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis)
    svg.selectAll('.y-axis path').attr('stroke', 'none')
  })

  d3.select('#director2').on('stepin', () => {
    var dir2MovieName = dir2Datapoints.map(d => d['Movie Name'])
    yPositionScale.domain(dir2MovieName).range([(height - 50) / 1.5, 180])
    svg.selectAll('.x-axis').remove()

    svg
      .append('g')
      .transition()
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0, ' + (height - 20) / 1.5 + ')')
      .call(xAxis)
    // svg
    //   .selectAll('.x-axis')
    //   .attr('transform', 'translate(0, ' + (height - 20) / 1.5 + ')')
    //   .call(xAxis)
    svg.selectAll('.domain').remove()

    svg.selectAll('#act1').remove()
    svg.selectAll('#act2').remove()
    svg.selectAll('#bar').remove()
    svg.selectAll('.y-axis').remove()

    svg
      .selectAll('.act1')
      .data(dir2Datapoints)
      .enter()
      .append('circle')
      .attr('class', d => {
        return 'dif' + d['dif'] + d['Release Year'] + ' ' + d['Actor 1 Gender']
      })
      .attr('id', 'act1')
      .attr('cx', d => xPostion(d.Director) - 25)
      .attr('cy', 25)
      .transition()
      .attr('cx', d => {
        var age = +d['Actor 1 Age']
        return xPositionScale(age)
      })
      .attr('cy', d => {
        return yPositionScale(d['Movie Name'])
      })
      .attr('r', 6)
      .attr('fill', d => colorScale(d.Director))

    svg.selectAll('.act2')
      .data(dir2Datapoints)
      .enter()
      .append('circle')
      .attr('class', d => {
        return 'dif' + d['dif'] + d['Release Year'] + ' ' + d['Actor 2 Gender']
      })
      .attr('id', 'act2')
      .attr('cx', d => xPostion(d.Director) - 25)
      .attr('cy', 25)
      .transition()
      .attr('cx', d => {
        var age = +d['Actor 2 Age']
        return xPositionScale(age)
      })
      .attr('cy', d => {
        return yPositionScale(d['Movie Name'])
      })
      .attr('r', 6)
      .attr('fill', d => colorScale(d.Director))

    svg.selectAll('.bar')
      .data(dir2Datapoints)
      .enter()
      .append('line')
      .attr('x1', d => xPostion(d.Director) - 25)
      .attr('x2', d => xPostion(d.Director) - 25)
      .attr('y1', 25)
      .attr('y2', 25)
      .transition()
      .attr('class', d => 'dif' + d['dif'] + d['Release Year'])
      .attr('id', 'bar')
      .attr('x1', d => {
        return xPositionScale(+d['Actor 1 Age'])
      })
      .attr('y1', d => yPositionScale(d['Movie Name']))
      .attr('x2', d => xPositionScale(+d['Actor 2 Age']))
      .attr('y2', d => yPositionScale(d['Movie Name']))
      .attr('stroke-width', 1)
      .attr('stroke', d => colorScale(d.Director))
      .attr('opacity', 0.5)

    //* MOUSEOVER PART *//
    svg.selectAll('circle')
      .on('mouseover', function (d) {
        var className = 'dif' + d['dif'] + d['Release Year']
        d3.select('circle.' + className)
          .raise()
          .transition()
          .attr('r', 10)
          .attr('stroke-width', 1)
          .attr('fill', '#3C5A6A')

        d3.select('circle.' + className)
          .raise()
          .transition()
          .attr('r', 10)
          .attr('stroke-width', 1)
          .attr('fill', '#BC5E21')

        d3.selectAll('line.' + className)
          .transition()
          .attr('stroke-width', '3')

        div.transition().style('opacity', 0.9)

        div
          .html(d['Actor 2 Name'] + ': ' + d['Actor 2 Age'] + '<br/>' + d['Actor 1 Name'] + ': ' + d['Actor 1 Age'] +
            '<br/>' +
            'Release Year: ' + d['Release Year']
          )
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px')
      })
      .on('mouseout', function (d, i) {
        var className = 'dif' + d['dif'] + d['Release Year']
        div.transition().style('opacity', 0)

        d3.selectAll('circle.' + className)
          .transition()
          .attr('stroke', 'none')
          .attr('r', 6)
          .attr('stroke-width', 0)
          .attr('fill', d => colorScale(d.Director))

        d3.selectAll('line.' + className)
          .transition()
          .attr('stroke-width', '1')
      })

    svg.selectAll('.labels').transition().attr('opacity', 0.2)
    // .attr('fill', function (d) {
    //   // console.log(d.key.toLowerCase().replace(/ /g, ''))
    //   return 'url(#' + d.key.toLowerCase().replace(/ /g, '') + ')'
    // })
    svg.selectAll('.johnglen')
      .transition()
      .attr('opacity', 0.9)

    svg.selectAll('.labels-text').transition().attr('opacity', 0.2)
    // .attr('fill', d => colorScale(d.key))
    svg.selectAll('.textjohnglen')
      .transition()
      .attr('opacity', 0.9)

    var yAxis = d3.axisLeft(yPositionScale)
    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis)
    svg.selectAll('.y-axis path').attr('stroke', 'none')
  })

  d3.select('#director1').on('stepin', () => {
    var dir1MovieName = dir1Datapoints.map(d => d['Movie Name'])
    yPositionScale.domain(dir1MovieName).range([height - 50, 180])
    svg.selectAll('#act1').remove()
    svg.selectAll('#act2').remove()
    svg.selectAll('#bar').remove()
    svg.selectAll('.y-axis').remove()
    svg.selectAll('.x-axis').remove()

    var xAxis = d3.axisBottom(xPositionScale)
    svg
      .append('g')
      .transition()
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0, ' + (height - 30) + ')')
      .call(xAxis)
    svg.selectAll('.domain').remove()

    svg
      .selectAll('.act1')
      .data(dir1Datapoints)
      .enter()
      .append('circle')
      .attr('class', d => {
        return 'dif' + d['dif'] + d['Release Year'] + ' ' + d['Actor 1 Gender']
      })
      .attr('id', 'act1')
      .attr('cx', d => xPostion(d.Director) - 25)
      .attr('cy', 25)
      .transition()
      .attr('cx', d => {
        var age = +d['Actor 1 Age']
        return xPositionScale(age)
      })
      .attr('cy', d => {
        return yPositionScale(d['Movie Name'])
      })
      .attr('r', 6)
      .attr('fill', d => colorScale(d.Director))

    svg.selectAll('.act2')
      .data(dir1Datapoints)
      .enter()
      .append('circle')
      .attr('cx', d => xPostion(d.Director) - 25)
      .attr('cy', 25)
      .transition()
      .attr('class', d => {
        return 'dif' + d['dif'] + d['Release Year'] + ' ' + d['Actor 2 Gender']
      })
      .attr('id', 'act2')
      .attr('cx', d => {
        var age = +d['Actor 2 Age']
        return xPositionScale(age)
      })
      .attr('cy', d => {
        return yPositionScale(d['Movie Name'])
      })
      .attr('r', 6)
      .attr('fill', d => colorScale(d.Director))

    svg.selectAll('.bar')
      .data(dir1Datapoints)
      .enter()
      .append('line')
      .attr('x1', d => xPostion(d.Director) - 25)
      .attr('x2', d => xPostion(d.Director) - 25)
      .attr('y1', 25)
      .attr('y2', 25)
      .transition()
      .attr('class', d => 'dif' + d['dif'] + d['Release Year'])
      .attr('id', 'bar')
      .attr('x1', d => {
        return xPositionScale(+d['Actor 1 Age'])
      })
      .attr('y1', d => yPositionScale(d['Movie Name']))
      .attr('x2', d => xPositionScale(+d['Actor 2 Age']))
      .attr('y2', d => yPositionScale(d['Movie Name']))
      .attr('stroke-width', 1)
      .attr('stroke', d => colorScale(d.Director))

    //* MOUSEOVER PART *//
    svg.selectAll('circle')
      .on('mouseover', function (d) {
        var className = 'dif' + d['dif'] + d['Release Year']

        d3.select('circle.' + className)
          .raise()
          .transition()
          .attr('r', 10)
          .attr('stroke-width', 1)
          .attr('fill', '#3C5A6A')

        d3.select('circle.' + className)
          .raise()
          .transition()
          .attr('r', 10)
          .attr('stroke-width', 1)
          .attr('fill', '#BC5E21')

        d3.selectAll('line.' + className)
          .transition()
          .attr('stroke-width', '3')

        div.transition().style('opacity', 0.9)

        div
          .html(d['Actor 2 Name'] + ': ' + d['Actor 2 Age'] + '<br/>' + d['Actor 1 Name'] + ': ' + d['Actor 1 Age'] +
            '<br/>' +
            'Release Year: ' + d['Release Year']
          )
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px')
      })
      .on('mouseout', function (d, i) {
        var className = 'dif' + d['dif'] + d['Release Year']
        div.transition().style('opacity', 0)

        d3.selectAll('circle.' + className)
          .transition()
          .attr('stroke', 'none')
          .attr('r', 6)
          .attr('fill', d => colorScale(d.Director))

        d3.selectAll('line.' + className)
          .transition()
          .attr('stroke-width', '1')
          .attr('stroke', d => colorScale(d.Director))
      })

    // this is change for label part!
    svg.selectAll('.labels').transition().attr('opacity', 0.2)
    // .attr('fill', function (d) {
    //   return 'url(#' + d.key.toLowerCase().replace(/ /g, '') + ')'
    // })

    svg.selectAll('.woodyallen')
      .transition()
      .attr('opacity', 0.9)

    svg.selectAll('.labels-text').transition().attr('opacity', 0.2)
    // .attr('fill', d => colorScale(d.key))
    svg.selectAll('.textwoodyallen')
      .transition()
      .attr('opacity', 0.9)

    var yAxis = d3.axisLeft(yPositionScale)
    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .transition()
      .call(yAxis)
    svg.selectAll('.y-axis path').attr('stroke', 'none')
  })
}
