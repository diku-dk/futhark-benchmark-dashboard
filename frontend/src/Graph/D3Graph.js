import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import ReactResizeDetector from 'react-resize-detector'
import * as d3 from 'd3'
import _ from 'lodash'

import {extract, speedup} from './utils'
import {slider, handle} from './drag'
import './D3Graph.css'

class D3Graph extends Component {
  datasets = []

  // Initialize chart container
  componentDidMount() {
    this._initialize()
  }

  // Render via d3
  componentDidUpdate() {
    this._clear()

    let {yMax, type, colors} = this.props
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

    // Combine datasets into one
    datasets = this.datasets.map(x => x.data)
    let combined = _.flatten(datasets)

    // Find domain of all data
    let xDomain = d3.extent(combined, d => d.x)
    let yDomain = [0, d3.max(combined, d => d.y)]

    // Set new domains
    this.overviewXScale.domain(xDomain)
    this.overviewYScale.domain(yDomain)

    // TODO: Make yMax 0 - 1
    // and independent of speedup
    if (type === 'speedup') {
      yDomain[1] = Math.min(yDomain[1], +yMax)
    }

    this.selectedXScale.domain(xDomain)
    this.selectedYScale.domain(yDomain)

    // Redraw axes
    this.x_axis.call(this.x_component)
    this.y_axis.call(this.y_component)

    for (let dataset of this.datasets) {
      let {data, color} = dataset

      // Create paths for the dataset
      let stdDevPath = this.s_graphs.append('path')
      let selectedPath = this.s_graphs.append('path')
      let overviewPath = this.o_graphs.append('path')

      stdDevPath.classed('d3-area', true)
      selectedPath.classed('d3-graph', true)
      overviewPath.classed('d3-graph', true)

      stdDevPath.attr('d', this.stdDevArea(data))
      selectedPath.attr('d', this.s_valueline(data))
      overviewPath.attr('d', this.o_valueline(data))

      // Store references to paths
      dataset.stdDevPath = stdDevPath
      dataset.selectedPath = selectedPath
      dataset.overviewPath = overviewPath

      if (color) {
        // Set graph color
        stdDevPath.style('fill', `rgb(${color})`)
        selectedPath.style('stroke', `rgb(${color})`)
        overviewPath.style('stroke', `rgb(${color})`)
      }
    }

    // Rescale to the size
    // of the slider
    this._rescale()
  }

  render() {
    return (
      <div className='d3-container'>
        <ReactResizeDetector handleWidth handleHeight onResize={this._resize}/>
      </div>
    )
  }


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
      let actual = this.selectedXScale.invert(x)

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
      x = this.selectedXScale(p[0].d.x)

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

    // Additional rescale drag handlers
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
    this.selectedXScale = d3.scaleTime()
    this.selectedYScale = d3.scaleLinear()
    this.overviewXScale = d3.scaleTime()
    this.overviewYScale = d3.scaleLinear()

    // Keep valueline within range
    this.selectedXScale.clamp(true)

    // Selected valueline
    this.s_valueline = d3.line()
      .x(d => this.selectedXScale(d.x))
      .y(d => this.selectedYScale(d.y))

    // x-overview valueline
    this.o_valueline = d3.line()
      .x(d => this.overviewXScale(d.x))
      .y(d => this.overviewYScale(d.y))

    // Standard deviation area
    this.stdDevArea = d3.area()
      .x(d => this.selectedXScale(d.x))
      .y0(d => this.selectedYScale(d.y - d.stdDev))
      .y1(d => this.selectedYScale(d.y + d.stdDev))

    // Initialize axes
    this.x_axis = this.selected.append('g')
    this.y_axis = this.selected.append('g')

    this.x_axis.classed('y-axis', true)
    this.y_axis.classed('x-axis', true)

    this.x_component = d3.axisBottom(this.selectedXScale)
    this.y_component = d3.axisLeft(this.selectedYScale)

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
    let [x0, x1] = this.overviewXScale.domain()
    x0 = x0.getTime()
    x1 = x1.getTime()

    // Calculate new domain
    let newX0 = new Date(x0 + from * (x1 - x0))
    let newX1 = new Date(x0 + to * (x1 - x0))
    this.selectedXScale.domain([newX0, newX1])

    // Redraw graphs
    for (let dataset of this.datasets) {
      let {data, stdDevPath, selectedPath} = dataset
      stdDevPath.attr('d', this.stdDevArea(data))
      selectedPath.attr('d', this.s_valueline(data))
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
    let selectedRect = selected.getBoundingClientRect()
    let overviewRect = overview.getBoundingClientRect()

    // Resize axes
    this.selectedXScale.range([0, selectedRect.width])
    this.selectedYScale.range([selectedRect.height, 0])
    this.overviewXScale.range([0, overviewRect.width])
    this.overviewYScale.range([overviewRect.height, 0])

    // Recalculate tick amount. The value doesn't translate
    // directly to the amount of ticks since D3 decides
    let xTicks = Math.max(2, selectedRect.width / 100)
    let yTicks = Math.max(2, selectedRect.height / 30)

    this.x_component.ticks(xTicks)
    this.y_component.ticks(yTicks)

    // Update tick line width / height
    this.x_component.tickSizeInner(-selectedRect.height)
    this.y_component.tickSizeInner(-selectedRect.width)

    // Move x-axis to the bottom
    this.x_axis.attr('transform', `translate(0,${selectedRect.height})`)

    // Redraw axes
    this.x_axis.call(this.x_component)
    this.y_axis.call(this.y_component)

    // Resize graph paths
    for (let dataset of this.datasets) {
      let {data, stdDevPath, selectedPath, overviewPath} = dataset
      stdDevPath.attr('d', this.stdDevArea(data))
      selectedPath.attr('d', this.s_valueline(data))
      overviewPath.attr('d', this.o_valueline(data))
    }
  }

  // Clear all paths
  _clear = () => {
    // Remove all path elements
    for (let dataset of this.datasets) {
      let {stdDevPath, selectedPath, overviewPath} = dataset
      stdDevPath.remove()
      selectedPath.remove()
      overviewPath.remove()
    }

    this.datasets = []
  }
}

export default D3Graph
