
import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import ReactResizeDetector from 'react-resize-detector'
import * as d3 from 'd3'
import _ from 'lodash'

import {slider, handle} from './drag'

class D3Graph extends Component {

  datasets = []

  // Initialize chart
  componentDidMount() {
    this._initialize()
  }

  componentDidUpdate() {
    this._resize() // Todo: rem
    //this._extract_data()
    this._render()
  }

  render() {
    return (
      <div className='g3-container'>
        <ReactResizeDetector handleWidth handleHeight onResize={this._resize}/>
      </div>
    )
  }

  // Initialize chart container
  _initialize() {
    // Initialize selected view
    let at = findDOMNode(this)
    this.container = d3.select(at)
    this.selected = this.container.append('svg')
    this.selected.classed('selected', true)

    this.selected.on('mousemove', () => {
      if (this.datasets.length === 0) return

      var bisect = d3.bisector(d => d.x).left;
      var x = d3.mouse(this.selected.node())[0]
      var actual = this.s_x_scale.invert(x)

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
      p = p.filter(x => p[0].d.commit == x.d.commit)

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
    slider.on('drag', this._sl_x_rescale)
    handle.on('drag', this._sl_x_rescale)

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

    // Clamp y-axis to height
    let s_defs = this.selected.append('defs')
    let c_path = s_defs.append('clipPath')
    c_path.attr('id', 'clip')
    c_path.append('rect')

    // Initialize graph containers
    this.s_graphs = this.selected.append('g').attr("clip-path", "url(#clip)")
    this.o_graphs = this.overview.append('g')

    // Size the chart
    this._resize()
  }

  // Rescale the x-axis. It rescales
  // the slider if `slider` is true
  _x_rescale = (from, to, slider = false) => {
    // Current total domain as integers
    let [c_x1, c_x2] = this.o_x_scale.domain()
    c_x1 = c_x1.getTime()
    c_x2 = c_x2.getTime()

    // New domain
    let x1 = new Date(c_x1 + from * (c_x2 - c_x1))
    let x2 = new Date(c_x1 + to * (c_x2 - c_x1))
    this.s_x_scale.domain([x1, x2])

    // Redraw graphs
    for (let dataset of this.datasets) {
      let {data, s_path} = dataset
      s_path.attr('d', this.s_valueline(data))
    }

    // Redraw axes
    this.x_axis.call(this.x_component)
    this.y_axis.call(this.y_component)

    if (!slider) return

    // TODO: Rescale slider
    // Not used atm. either way
  }

  // Rescale based on the dimensions
  // of the x-overview slider
  _sl_x_rescale = () => {
    let sl_x = parseFloat(this.slider.attr('x'))
    let sl_w = parseFloat(this.slider.attr('width'))
    this._x_rescale(sl_x / 100, (sl_x + sl_w) / 100)
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
      let {data, s_path, o_path} = dataset
      s_path.attr('d', this.s_valueline(data))
      o_path.attr('d', this.o_valueline(data))
    }
  }

  // Clear all paths
  _clear = () => {
    // Remove all path elements
    for (let dataset of this.datasets) {
      let {s_path, o_path} = dataset
      s_path.remove()
      o_path.remove()
    }

    this.datasets = []
  }

  // Render paths via d3
  _render = () => {
    // Clear previous
    this._clear()

    let {
      colors,
      commits,
      skeleton,
      selected,
      y_max,
      type
    } = this.props


    let dat = this._extract_data()

    for (let idx in dat) {
      if (dat[idx] == null) continue
      if (type === 'speedup') {
        const minY = d3.min(dat[idx], d => d.y)

        for (let idx2 in dat[idx]) {
          dat[idx][idx2].y = dat[idx][idx2].y / minY
        }
      }
    }

    let dat2 = dat.filter(x => x != null)
    let all = _.flatten(dat2)
    // Check if all
    var x_domain = d3.extent(all, function(d) { return d.x; })
    var y_domain = [0, d3.max(all, function(d) { return d.y; })]


    // Expand / set new domain
    this.o_x_scale.domain(x_domain)
    this.o_y_scale.domain(y_domain)

    if (type === 'speedup')
      y_domain[1] = Math.min(y_domain[1], +y_max)
    this.s_x_scale.domain(x_domain)
    this.s_y_scale.domain(y_domain)
    // Redraw axes
    this.x_axis.call(this.x_component)
    this.y_axis.call(this.y_component)

    for (let idx in dat) {
      if (dat[idx] == null) continue
      this._add(dat[idx], idx)
    }

    // Rescale to slider %
    this._sl_x_rescale()
  }

  _extract_data = () => {
    // Extract properties
    let {data, dates, selected} = this.props

    // Get datasets for selected paths
    return selected.map(path => {
      // Is selected path complete?
      if (path.dataset == null) return null

      let {backend, machine, benchmark, dataset} = path
      let at = [benchmark, 'datasets', dataset]
      let commits = data[backend][machine]
      let result = []

      // Extract points
      for (let commit in commits) {
        let benchmarks = commits[commit]
        let d = _.get(benchmarks, at, null)
        if (d == null) continue

        d = _.clone(d)
        d.commit = commit
        d.x = new Date(dates[commit])
        d.y = d.avg

        delete d.avg

        result.push(d)
      }

      result.sort((x, y) => d3.ascending(x.x, y.x))

      return result
    })
  }


  _add = (data, idx) => {
    // Create paths and insert data
    var s_path = this.s_graphs.append('path')
    var o_path = this.o_graphs.append('path')

    s_path.classed('graph', true)
    o_path.classed('graph', true)

    s_path.attr('d', this.s_valueline(data))
    o_path.attr('d', this.o_valueline(data))

    //var colour = this.scheme.shift()

    let colour = this.props.colors[idx]
    if (colour) {
      // Set graph colour
      s_path.style('stroke', `rgba(${colour}, 1)`)
      o_path.style('stroke', `rgba(${colour}, 1)`)
    }

    // Return index
    var dataset = {s_path, o_path, data}
    return this.datasets.push(dataset) - 1
  }
}

export default D3Graph
