import * as d3 from 'd3'
// import { debounce } from 'debounce'

const margin = {
  top: 30,
  right: 20,
  bottom: 45,
  left: 90
}

const width = 700 - margin.left - margin.right
const height = 700 - margin.top - margin.bottom

const svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var xPositionScale = d3
  .scaleLinear()
  .range([0, width])
  .domain([15, 85])

var yPositionScale = d3
  .scaleLinear()
  .range([height, 0])
  .domain([15, 85])

var div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)

d3.csv(require('./data/age_gap.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready (datapoints) {
  // Add dots for each
  svg
    .selectAll('circles')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', d => d['Movie Name'].toLowerCase().replace(/\s+/g, '-'))
    .classed('couples', true)
    .attr('id', d => {
      var str = d.Director
      str = str.replace(/\s+/g, '-').toLowerCase()
      return str
    })
    .attr('r', 0)
    .attr('cx', width / 2)
    .attr('cy', 0)
    .attr('fill', function (d) {
      // color couples based on the older gender
      if (+d['Actor 1 Age'] > +d['Actor 2 Age'] & d['Actor 1 Gender'] === 'man') {
        return '#3C5A6A'
      } else if (+d['Age Difference'] === 0) {
        return '#D9A746'
      } else {
        return '#BC5E21'
      }
    })
    .attr('opacity', 0)
    .on('mouseover', function (d) {
      // set up tooltip text
      div
        .transition()
        .duration(200)
        .style('opacity', 0.9)
      div
        .html(
          d['Actor 1 Name'].bold() + ' (' + d['Actor 1 Age'] + ' y.o.)' +
            '<br/>' + ' ♡ ' + '<br/>' +
            d['Actor 2 Name'].bold() + ' (' + d['Actor 2 Age'] + ' y.o.)' +
            '<br/>' + 'Age difference: ' +
            d['Age Difference'] + '<br/>' +
            'Movie: ' + d['Movie Name'] + ' (' + d['Release Year'] + ')'
        )
        .style('left', d3.event.pageX + 20 + 'px')
        .style('top', d3.event.pageY - 28 + 'px')
    })
    .on('mouseout', function (d) {
      div
        .transition()
        .duration(500)
        .style('opacity', 0)
    })

  /* Set up axes */
  var xAxis = d3
    .axisBottom(xPositionScale)
    .ticks(5)
    .tickFormat(d => {
      if (+d === 80) {
        return d + ' years old'
      } else {
        return d
      }
    })
    .tickSize(-height)
    .tickPadding(10)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .attr('stroke-width', 0.1)
    .attr('stroke', 'lightgrey')
    .style('visibility', 'hidden')
    .lower()

  var yAxis = d3
    .axisLeft(yPositionScale)
    .ticks(5)
    .tickFormat(d => {
      if (+d === 80) {
        return d + ' years old'
      } else {
        return d
      }
    })
    .tickSize(-width)
    .tickPadding(10)

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .attr('stroke-width', 0.1)
    .attr('stroke', 'lightgrey')
    .style('visibility', 'hidden')
    .lower()

  // remove bounding box
  svg.selectAll('.domain').remove()

  // add text. Transform translate is based on x and y pos scales
  svg
    .append('text')
    .text('Actors are the same age')
    .attr('class', 'textLine')
    .attr('font-weight', 'bold')
    .attr('fill', '#4B1803')
    .attr('x', 10)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('transform', 'translate(' + xPositionScale(75) + ',' + yPositionScale(76) + ') rotate(-47)')
    .attr('opacity', 0)

  // add age line
  svg
    .append('line')
    .attr('class', 'ageLine')
    .attr('x1', 0)
    .attr('y1', height)
    .attr('x2', 0)
    .attr('y2', height)
    .lower()

  // START STEPIN
  d3.select('#intro').on('stepin', () => {
    // unhide axis
    svg
      .selectAll('.axis')
      .transition()
      .style('visibility', 'visible')

    // reset circles
    svg
      .selectAll('.couples')
      .transition()
      .duration(500)
      .attr('cx', d => xPositionScale(+d['Actor 1 Age']))
      .attr('cy', d => yPositionScale(+d['Actor 2 Age']))
      .attr('stroke', 'none')
      .attr('r', 3)
      .attr('opacity', 0.8)

    // reset line
    svg
      .select('.ageLine')
      .transition()
      .attr('x1', 0)
      .attr('y1', height)
      .attr('x2', 0)
      .attr('y2', height)

    // reset line text
    svg
      .select('.textLine')
      .transition()
      .attr('opacity', 0)
  })

  d3.select('#older-men').on('stepin', () => {

  })

  // highlight same age
  d3.select('#same-age').on('stepin', () => {
    // add a line for matching age
    svg
      .select('.ageLine')
      .transition()
      .duration(600)
      .attr('y2', 0)
      .attr('x2', width)
      .attr('stroke', '#4B1803')
      .attr('stroke-width', 1.8)
      .attr('opacity', 0.7)

    svg
      .select('.textLine')
      .transition()
      .duration(600)
      .attr('opacity', 1)

    // HGIHLIGHT COUPLES WITH THE SAME AGE HERE
    svg
      .selectAll('.couples')
      .transition()
      .attr('r', d => {
        if (+d['Age Difference'] === 0) {
          return 10
        } else {
          return 3
        }
      })
      .attr('stroke', d => {
        if (+d['Age Difference'] === 0) {
          return 'black'
        } else {
          return 'none'
        }
      })
  })

  // highlight LGBT
  d3.select('#lgbt').on('stepin', () => {
    svg
      .selectAll('.couples')
      .transition()
      .attr('r', d => {
        if (d['Actor 1 Gender'] === d['Actor 2 Gender']) {
          return 10
        } else {
          return 3
        }
      })
      .attr('stroke', d => {
        if (d['Actor 1 Gender'] === d['Actor 2 Gender']) {
          return 'black'
        } else {
          return 'none'
        }
      })
  })

  // # stepin bond (director==='john-glen' OR 'lewis-gilbert')
  d3.select('#bond').on('stepin', () => {
    svg
      .selectAll('.couples')
      .transition()
      .attr('stroke', 'none')
      .attr('r', 3)

    svg
      .selectAll('#john-glen, #lewis-gilbert')
      .transition()
      .attr('stroke', 'black')
      .attr('r', 10)
  })

  // # stepin muade director === 'hal-ashby'
  d3.select('#maude').on('stepin', () => {
    svg
      .selectAll('.couples')
      .transition()
      .attr('stroke', 'none')
      .attr('r', 3)

    svg
      .selectAll('#hal-ashby')
      .transition()
      .attr('stroke', 'black')
      .attr('r', 10)
  })
  // # stepin woody (director ==='woody-allen')

  d3.select('#woody').on('stepin', () => {
    svg
      .selectAll('.couples')
      .transition()
      .attr('stroke', 'none')
      .attr('r', 3)

    svg
      .selectAll('#woody-allen')
      .transition()
      .attr('stroke', 'black')
      .attr('r', 10)
  })

  // setpin coen (director === 'joel-coen')
  d3.select('#coen').on('stepin', () => {
    svg
      .selectAll('.couples')
      .transition()
      .attr('cx', d => xPositionScale(+d['Actor 1 Age']))
      .attr('cy', d => yPositionScale(+d['Actor 2 Age']))
      .attr('stroke', 'none')
      .attr('r', 3)
      .attr('opacity', 0.8)

    svg
      .selectAll('#joel-coen')
      .transition()
      .attr('stroke', 'black')
      .attr('r', 10)
  })

  d3.select('#end01').on('stepin', () => {
     svg
      .selectAll('.couples')
      .attr('stroke', 'none')
      .attr('r', 3)
  })
  

  $(document).ready(function () {
    BindControls()
  })

  function BindControls () {
    var movies = datapoints.map(d => d['Movie Name'])

    $('#tbMovies').autocomplete({
      source: movies,
      minLength: 0,
      scroll: true,
      select: function (event, ui) {
        $('#tbMovies').blur()
        console.log('you picked', ui.item.label, ui.item.value)
        d3.selectAll(ui.item.label)
          .attr('class', d => d['Movie Name'].toLowerCase().replace(/\s+/g, '-'))
        d3.selectAll('.couples')
          .raise()
          .attr('fill', d => {
            if (ui.item.label === d['Movie Name']) {
              return '#d9a746'
            } else {
              return 'grey'
            }
          })
          .attr('r', d => {
            if (ui.item.label === d['Movie Name']) {
              return 7
            } else {
              return 3
            }
          })
      }
    })
  }
}
