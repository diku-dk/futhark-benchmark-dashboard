import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import ReactResizeDetector from 'react-resize-detector'
import * as d3 from 'd3'
import _ from 'lodash'

import {extract, speedup} from './utils'
import {slider, handle} from './drag'
import './D3Graph.css'

class D3Graph extends Component {
  componentDidMount() {
    this._initialize()
  }

  componentDidUpdate() {
    this._render()
  }

  render() {
    return (
      <div className='d3-container'>
        <ReactResizeDetector handleWidth handleHeight onResize={this._resize}/>
      </div>
    )
  }

  datasets = []

  // Initialize chart container
  _initialize() {
    // Initialize selected view
    let at = findDOMNode(this)
    this.container = d3.select(at)
    this.selected = this.container.append('svg')
    this.selected.classed('selected', true)

    this.selected.on('mousemove', () => {
      if (this.datasets.length === 0) return

      let bisect = d3.bisector(d => d.x).left;
      let x = d3.mouse(this.selected.node())[0]
      let actual = this.s_x_scale.invert(x)

      // Find potential closest
      // points to the cursor
      let p = []
      for (let i in this.datasets) {
        let {data} = this.datasets[i]
        let j = bisect(data, actual, 1)
        p.push({d: data[j], i})
        p.push({d: data[j - 1], i})
      }

      // Remove undefined
      p = p.filter(x => x.d)

      // Sort by closest
      p = p.sort((a, b) => {
        let x0 = Math.abs(a.d.x - actual)
        let x1 = Math.abs(b.d.x - actual)
        return d3.descending(x1, x0)
      })

      // Return if no points
      if (p.length === 0) return

      // Only keep the commits with
      // the same hash as the closest
      p = p.filter(x => p[0].d.commit === x.d.commit)

      // Find offset
      x = this.s_x_scale(p[0].d.x)

      d3.select('.caret')
        .attr('x1', x)
        .attr('x2', x)
    })

    this.selected.append('line')
      .classed('caret', true)
      .attr('y2', '100%')

    // Initialize x-overview
    this.overview = this.container.append('svg')
    this.overview.classed('x-overview', true)

    // Additional rescale drag handler
    slider.on('drag', this._rescale)
    handle.on('drag', this._rescale)

    // Slider group
    var g = this.overview.append('g')

    // Append slider
    this.slider = g.append('rect')
      .classed('slider', true)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('x', '0%')
      .call(slider)

    // Append west handle
    g.append('rect')
      .classed('handle', true)
      .attr('height', '100%')
      .attr('x', '0%')
      .call(handle)

    // Append east handle
    g.append('rect')
      .classed('handle', true)
      .attr('height', '100%')
      .attr('x', '100%')
      .call(handle)

    // Initialize scales
    this.s_x_scale = d3.scaleTime()
    this.s_y_scale = d3.scaleLinear()
    this.o_x_scale = d3.scaleTime()
    this.o_y_scale = d3.scaleLinear()

    // Keep valueline within range
    this.s_x_scale.clamp(true)

    // Selected valueline
    this.s_valueline = d3.line()
      .x(d => this.s_x_scale(d.x))
      .y(d => this.s_y_scale(d.y))

    // x-overview valueline
    this.o_valueline = d3.line()
      .x(d => this.o_x_scale(d.x))
      .y(d => this.o_y_scale(d.y))

    // Standard deviation area
    this.std_area = d3.area()
      .x(d => this.s_x_scale(d.x))
      .y0(d => this.s_y_scale(d.y - d.stdDev))
      .y1(d => this.s_y_scale(d.y + d.stdDev))

    // Initialize axes
    this.x_axis = this.selected.append('g')
    this.y_axis = this.selected.append('g')

    this.x_axis.classed('y-axis', true)
    this.y_axis.classed('x-axis', true)

    this.x_component = d3.axisBottom(this.s_x_scale)
    this.y_component = d3.axisLeft(this.s_y_scale)

    this.x_component.tickSizeOuter(0)
    this.y_component.tickSizeOuter(0)

    this.x_component.tickPadding(8)
    this.y_component.tickPadding(8)

    // Initialize graph containers
    this.s_graphs = this.selected.append('g')
    this.o_graphs = this.overview.append('g')

    // Clamp y-axis to height
    this.selected.append('defs')
      .append('clipPath')
      .attr('id', 'd3-clip')
      .append('rect')
    this.s_graphs.attr('clip-path', 'url(#d3-clip)')

    // Size the chart
    this._resize()
  }

  // Rescale the x-axis based on the
  // position and size of the slider
  _rescale = () => {
    // From and to values between 0 to 1
    let from = parseFloat(this.slider.attr('x')) / 100
    let to = from + parseFloat(this.slider.attr('width')) / 100

    // Current total domain as integers
    let [x0, x1] = this.o_x_scale.domain()
    x0 = x0.getTime()
    x1 = x1.getTime()

    // Calculate new domain
    let new_x0 = new Date(x0 + from * (x1 - x0))
    let new_x1 = new Date(x0 + to * (x1 - x0))
    this.s_x_scale.domain([new_x0, new_x1])

    // Redraw graphs
    for (let dataset of this.datasets) {
      let {data, a_path, s_path} = dataset
      a_path.attr('d', this.std_area(data))
      s_path.attr('d', this.s_valueline(data))
    }

    // Redraw axes
    this.x_axis.call(this.x_component)
    this.y_axis.call(this.y_component)
  }

  // Resize the chart to the
  // size of the container
  _resize = () => {
    // Get dimensions
    let selected = this.selected.node()
    let overview = this.overview.node()
    let s_rect = selected.getBoundingClientRect()
    let o_rect = overview.getBoundingClientRect()

    // Resize axes
    this.s_x_scale.range([0, s_rect.width])
    this.s_y_scale.range([s_rect.height, 0])
    this.o_x_scale.range([0, o_rect.width])
    this.o_y_scale.range([o_rect.height, 0])

    // Recalculate tick amount. The value
    // doesn't translate directly to the
    // amount of ticks since d3 decides
    let x_ticks = Math.max(2, s_rect.width / 100)
    let y_ticks = Math.max(2, s_rect.height / 30)

    this.x_component.ticks(x_ticks)
    this.y_component.ticks(y_ticks)

    // Update tick line width / height
    this.x_component.tickSizeInner(-s_rect.height)
    this.y_component.tickSizeInner(-s_rect.width)

    // Move x-axis to the bottom
    this.x_axis.attr('transform', 'translate(0,' + s_rect.height + ')')

    // Redraw axes
    this.x_axis.call(this.x_component)
    this.y_axis.call(this.y_component)

    // Resize graph paths
    for (let dataset of this.datasets) {
      let {data, a_path, s_path, o_path} = dataset
      a_path.attr('d', this.std_area(data))
      s_path.attr('d', this.s_valueline(data))
      o_path.attr('d', this.o_valueline(data))
    }
  }

  // Clear all paths
  _clear = () => {
    // Remove all path elements
    for (let dataset of this.datasets) {
      let {a_path, s_path, o_path} = dataset
      a_path.remove()
      s_path.remove()
      o_path.remove()
    }

    this.datasets = []
  }

  // Render paths via d3
  _render = () => {
    // Clear previous renditions
    this._clear()

    let {y_max, type, colors} = this.props
    let datasets = extract(this.props)

    // Apply speedup processing
    if (type === 'speedup') {
      datasets = speedup(datasets)
    }

    // Apply colors to datasets
    for (let i in datasets) {
      let dataset = datasets[i]
      if (dataset == null) continue

      this.datasets.push({
        data: dataset,
        color: colors[i]
      })
    }

    datasets = this.datasets.map(x => x.data)
    let combined = _.flatten(datasets)

    // Find domain of all data
    let x_domain = d3.extent(combined, d => d.x)
    let y_domain = [0, d3.max(combined, d => d.y)]

    // Set new domain
    this.o_x_scale.domain(x_domain)
    this.o_y_scale.domain(y_domain)

    // TODO: Make y_max 0 - 1
    // and not dependent on speedup
    if (type === 'speedup') {
      y_domain[1] = Math.min(y_domain[1], +y_max)
    }

    this.s_x_scale.domain(x_domain)
    this.s_y_scale.domain(y_domain)

    // Redraw axes
    this.x_axis.call(this.x_component)
    this.y_axis.call(this.y_component)

    // Creat paths and insert data
    for (let dataset of this.datasets) {
      let {data, color} = dataset

      let a_path = this.s_graphs.append('path')
      let s_path = this.s_graphs.append('path')
      let o_path = this.o_graphs.append('path')

      a_path.classed('d3-area', true)
      s_path.classed('graph', true)
      o_path.classed('graph', true)

      a_path.attr('d', this.std_area(data))
      s_path.attr('d', this.s_valueline(data))
      o_path.attr('d', this.o_valueline(data))

      dataset.a_path = a_path
      dataset.s_path = s_path
      dataset.o_path = o_path

      if (color) {
        // Set graph colour
        a_path.style('fill', `rgb(${color})`)
        s_path.style('stroke', `rgb(${color})`)
        o_path.style('stroke', `rgb(${color})`)
      }
    }

    // Rescale to slider %
    this._rescale()
  }
}

export default D3Graph
