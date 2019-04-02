import * as d3 from 'd3'
import fisheye from './fisheye'
import { scaleLinear, scalePow } from 'd3-scale'

let margin = { top: 100, left: 20, right: 20, bottom: 20 }

let height = 400 - margin.top - margin.bottom
let width = 900 - margin.left - margin.right

let svg = d3
  .select('#images2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

svg.append('rect')
  .attr('width', width)
  .attr('height', height)
  .attr('opacity', 0)

var xPositionScale = fisheye.scale(d3.scaleLinear)
  .range([0, width])
  .focus(width / 2)
  .distortion(6)

d3.csv(require('./data/df_age30.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready (datapoints) {
  xPositionScale.domain([0, datapoints.length])

  var holders = svg
    .selectAll('.image-holder')
    .data(datapoints)
    .enter()
    .append('g')
    .attr('class', 'image-holder')
    .attr('transform', (d, i) => {
      var xPosition = xPositionScale(i)
      return `translate(${xPosition}, 0)`
    })

  holders.append('text')
    .text(d => 'Movie: ' + d['Movie Name'] + ' ' + '(' + d['Release Year'] + ')')
    .attr('class', d => {
      var str = d['Movie Name'].replace(/'/g, '')
      return 'textelem' + str.replace(/\s+/g, '-').toLowerCase()
    })
    .classed('movie-text', true)
    .attr('x', 10)
    .attr('y', -50)
    .attr('dx', d => {
      if (d['Movie Name'] === 'The Quiet American ') {
        return -100
      } else {
        return 0
      }
    })
    .attr('text-anchor', 'star')
    .attr('fill', 'black')
    .attr('opacity', 0)

  holders.append('text')
    .text(d => d['Actor 1 Name'] + ' ' + '(' + d['Actor 1 Age'] + ')')
    .attr('class', d => {
      var str = d['Movie Name'].replace(/'/g, '')
      return 'textelem' + str.replace(/\s+/g, '-').toLowerCase()
    })
    .classed('movie-text', true)
    .attr('x', 10)
    .attr('y', -30)
    .attr('dx', d => {
      if (d['Movie Name'] === 'The Quiet American ') {
        return -100
      } else {
        return 0
      }
    })
    .attr('text-anchor', 'star')
    .attr('fill', 'black')
    .attr('opacity', 0)

  holders.append('text')
    .text(d => d['Actor 2 Name'] + ' ' + '(' + d['Actor 2 Age'] + ')')
    .attr('class', d => {
      var str = d['Movie Name'].replace(/'/g, '')
      console.log('textelem' + str.replace(/\s+/g, '-').toLowerCase())
      return 'textelem' + str.replace(/\s+/g, '-').toLowerCase()
    })
    .classed('movie-text', true)
    .attr('x', 10)
    .attr('y', -10)
    .attr('dx', d => {
      if (d['Movie Name'] === 'The Quiet American ') {
        return -100
      } else {
        return 0
      }
    })
    .attr('text-anchor', 'star')
    .attr('fill', 'black')
    .attr('opacity', 0)

  holders.append('image')
    .attr('xlink:href', d => {
      return d.image_url
    })
    .attr('class', d => {
      // console.log(d['Movie Name'].replace(/\s+/g, '-').toLowerCase())
      return d['Movie Name'].replace(/\s+/g, '-').toLowerCase()
    })
    .classed('movie-text', true).classed('movie-text', true)
    .attr('width', 190)
    .attr('height', height)
    .on('mouseover', function (d) {
      console.log(d)
      var str = d['Movie Name'].replace(/'/g, '')
      var class_selected = str.replace(/\s+/g, '-').toLowerCase()
      console.log(str)
      console.log(class_selected)
      d3.selectAll('.textelem' + class_selected).attr('opacity', 1)
      // d3.select('#movie-title').text(d['Movie Name'])
    })
    .on('mouseout', function (d) {
      console.log(d)
      var str = d['Movie Name'].replace(/'/g, '')
      var class_selected = str.replace(/\s+/g, '-').toLowerCase()
      console.log('textelem' + class_selected)
      d3.selectAll('.textelem' + class_selected).attr('opacity', 0)
    })

  holders.append('rect')
    .attr('stroke', 'none')
    .attr('height', height)
    .attr('width', 150)
    .attr('fill', 'none')

  function clamp (num, min, max) {
    return Math.max(min, Math.min(max, num))
  }

  function redraw () {
    let [mouseX, mouseY] = d3.mouse(this)

    // focus the x axis where the mouse is
    xPositionScale.focus(mouseX)

    svg.selectAll('.image-holder')
      .attr('transform', (d, i) => {
        var xPosition = xPositionScale(i)
        return `translate(${xPosition}, 0)`
      })
  }

  var drag = d3.drag()
    .on('start', redraw)
    .on('drag', redraw)

  svg.on('mousemove', redraw)
    .on('click', redraw)
    .call(drag)
}

// play with distortion and height so images look the righ size
