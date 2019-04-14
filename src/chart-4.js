import * as d3 from 'd3'
import $ from 'jquery'

var margin = { top: 25, left: 100, right: 170, bottom: 0 }
var width = 800 - margin.left - margin.right
var height = 400 - margin.top - margin.bottom
// Circle options
var circleRadius = 4
var sampleLength = 50
// Band options
var startY = height * 0.8
var sortingPoint = width * 0.45
var sortingTarget = sortingPoint + 100
var curveType = d3.curveMonotoneX
var bandSize = 20
// Timing options
var speed = 5
var maxInitialDelay = 800
// Append svg
var svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)
// Don't edit below here
var slowingConstant = 10
var circleSpeed = sampleLength * slowingConstant * (1 / speed)
var line = d3.line().curve(curveType)

d3.csv(require('./data/popularityxvalence.csv'))
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

function ready (datapoints) {
  // color determined by positiveness column in csv
  var colorScale = d3
    .scaleOrdinal()
    .domain(['sad', 'neutral', 'happy'])
    .range(['#7FF7EE', '#E9FFFF', '#84F7EF'])
  // final location on page determined by popularity column
  var yPositionScale = d3
    .scaleBand()
    .domain(['super popular', 'popular', 'not so popular'])
    .range([0, height])
  datapoints.map(d => yPositionScale(d.popularity))

  var holder = svg.append('g').attr('transform', `translate(0,${bandSize / 2})`)
  holder
    .append('g')
    .attr('class', 'display')
    .attr('transform', `translate(${width}, 0)`)
    .selectAll('g')
    .data(yPositionScale.domain())
    .enter()
    .append('g')
    .attr(
      'transform',
      d => `translate(20,${yPositionScale(d) - bandSize * 0.25})`
    )

  // Have to push this down half of the stroke width
  // because it's a scaleBand, so it starts at 0

  // creates the paths for the circle to travel
  holder
    .append('g')
    .attr('class', 'bands')
    .lower()
    .selectAll('path')
    .data(yPositionScale.domain())
    .enter()
    .append('path')
    .attr('d', d => {
      let points = [
        [width, startY], // push it off the left-hand side
        [width / 2, 0]
      ]
      return line(points)
    })
    .attr('stroke-width', 0)
    .attr('stroke', '#f3f3f3')
    .attr('fill', 'none')
    .attr('opacity', 0.2)
    .attr('id', d => `#path-${d.replace(/ /g, '-')}`)

  var points = {}

  svg.selectAll('path').each(function (d) {
    var length = this.getTotalLength()
    points[d] = []
    d3.range(length / sampleLength + 1).forEach(i => {
      let point = this.getPointAtLength(i * sampleLength)
      points[d].push([point.x, point.y])
    })
  })
  // They need a little wiggle so they don't all overlap
  // And how long should the circle wait before it starts moving?
  // record maxDelay
  datapoints.forEach(d => {
    d._offsetX = Math.random() * bandSize - bandSize / 2
    d._offsetY = Math.random() * bandSize - bandSize / 2
    d._delay = Math.random() * maxInitialDelay
  })
  // Add a group for every circle
  // that group is the x/y offset (the wiggle)
  // then add a circle inside of that which will
  // follow the path (the offset makes it not quite)

  var replayDelay = 0
  datapoints.forEach(d => (replayDelay = Math.max(replayDelay, d._delay)))

  // Starts transition for a circle
  function startTransition (d) {
    // What are the points it should be tweening between?
    var pathPoints = points[d.popularity]
    // How fast between each segment?
    var speed = Math.random() * circleSpeed + circleSpeed
    // Start the circle at the the point
    // initialize the transition easing, speed, etc
    var circle = d3
      .select(this)
      .attr('transform', `translate(${pathPoints[0]})`)
      .transition()
      .delay(d._delay)
      .duration(speed)
      .ease(d3.easeLinear)
    // This is like a forEach, but it will
    // stop once we're past the width
    pathPoints.every(point => {
      circle = circle.transition().attr('transform', `translate(${point})`)
      return point[0] + d._offsetX < width
    })

    setTimeout(function () {
      $('#replay-animation').css('visibility', 'visible') // by default hide the replay button
    }, replayDelay)
  }

  var circles = holder
    .selectAll('g')
    .data(datapoints)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d._offsetX},${d._offsetY})`)
    .append('circle')
    .attr('fill', d => colorScale(d.positiveness))
    .attr('r', circleRadius)
    .attr('opacity', 0)

  // add cell phone
  d3.select('svg').append('image')
    .attr('xlink:href', 'https://raw.githubusercontent.com/malbasi/wardrive-ny/master/src/images/phone.svg')
    .attr('class', 'cellphone')
    .attr('x', width * 1.1)
    .attr('y', startY)
    .attr('width', 80)
    .attr('height', 80)
    .attr('opacity', 1)
  // add antenna
  d3.select('svg').append('image')
    .attr('xlink:href', 'https://raw.githubusercontent.com/malbasi/wardrive-ny/master/src/images/antenna-01.png')
    .attr('class', 'antenna')
    .attr('x', width / 2 * 1.2)
    .attr('y', 0)
    .attr('width', 80)
    .attr('height', 80)
    .attr('opacity', 1)
  // add person
  d3.select('svg').append('image')
    .attr('xlink:href', 'https://raw.githubusercontent.com/malbasi/wardrive-ny/master/src/images/person.png')
    .attr('class', 'person')
    .attr('x', 60)
    .attr('y', startY)
    .attr('width', 80)
    .attr('height', 80)
    .attr('opacity', 0)
  // add MitM
  d3.select('svg').append('image')
    .attr('class', 'mitm')
    .attr('xlink:href', 'https://raw.githubusercontent.com/malbasi/wardrive-ny/master/src/images/mitm.png')
    .attr('x', width * 0.8)
    .attr('y', sortingTarget * 0.9)
    .attr('width', 80)
    .attr('height', 80)
    .attr('opacity', 0)

  let durt = 1000

  d3.select('#start').on('stepin', () => {
    holder.selectAll('path')
      .attr('d', d => {
        let points = [
          [width - 5, startY],
          [width / 2, 0]
        ]
        return line(points)
      })

    d3.selectAll('circle')
      .transition()
      .attr('opacity', 1)

    d3.select('.cellphone')
      .transition()
      .duration(durt)
      .attr('opacity', 1)

    d3.select('.antenna')
      .transition()
      .duration(durt)
      .attr('opacity', 1)

    svg.selectAll('path').each(function (d) {
      var length = this.getTotalLength()
      points[d] = []
      d3.range(length / sampleLength + 1).forEach(i => {
        let point = this.getPointAtLength(i * sampleLength)
        points[d].push([point.x, point.y])
      })
    })
    circles.each(startTransition)
  })

  d3.select('#stepTwo').on('stepin', () => {
    // d3.select('#chart-4').dispatch('stepin')
    console.log('step2')
    holder.selectAll('path')
      .attr('d', d => {
        let points = [

          [width / 2, 0],
          [0, startY]
        ]
        return line(points)
      })

    d3.select('.cellphone')
      .transition()
      .duration(durt)
      .attr('opacity', 1)
    d3.select('.antenna')
      .transition()
      .duration(durt)
      .attr('opacity', 1)
    d3.select('.person')
      .transition()
      .duration(durt)
      .attr('opacity', 1)

    svg.selectAll('path').each(function (d) {
      var length = this.getTotalLength()
      points[d] = []
      d3.range(length / sampleLength + 1).forEach(i => {
        let point = this.getPointAtLength(i * sampleLength)
        points[d].push([point.x, point.y])
      })
    })
    circles.each(startTransition)
  })

  d3.select('#stepThree').on('stepin', () => {
    // d3.select('#chart-4').dispatch('stepin')
    console.log('step2')
    holder.selectAll('path')
      .attr('d', d => {
        let points = [
          [width - 5, startY],
          [width * 0.7, sortingTarget],
          [width / 2, 0],
          [0, startY]
        ]
        return line(points)
      })

    d3.select('.cellphone')
      .transition()
      .duration(durt)
      .attr('opacity', 1)
    d3.select('.antenna')
      .transition()
      .duration(durt)
      .attr('opacity', 1)
    d3.select('.person')
      .transition()
      .duration(durt)
      .attr('opacity', 1)
    d3.select('.mitm')
      .transition()
      .duration(durt)
      .attr('opacity', 1)
    svg.selectAll('path').each(function (d) {
      var length = this.getTotalLength()
      points[d] = []
      d3.range(length / sampleLength + 1).forEach(i => {
        let point = this.getPointAtLength(i * sampleLength)
        points[d].push([point.x, point.y])
      })
    })
    circles.each(startTransition)
  })
}
