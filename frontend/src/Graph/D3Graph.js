import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import ReactResizeDetector from 'react-resize-detector'
import * as d3 from 'd3'
import saveSvgAsPng from 'save-svg-as-png'
import _ from 'lodash'
import {Button, Icon} from 'antd'

import {extract, slowdown} from './utils'
import {slider, handle} from './drag'
import './D3Graph.css'

let repoURL = 'https://github.com/diku-dk/futhark'
let formatTime = d3.timeFormat('%B %d, %Y');

class D3Graph extends Component {
  datasets = []

  // Initialize chart container
  componentDidMount() {
    let {xLeft, xRight} = this.props

    // Initialize selected view
    let at = findDOMNode(this)
    this.container = d3.select(at)

    // Create tooltip container
    this.tooltip = this.container.append('div')
      .classed('tooltip', true)

    // Create <svg> for the zoomable
    // visualization of the selected graphs
    this.selected = this.container.append('svg')
      .classed('selected', true)
      .on('mousemove', () => {
        this._resetTooltip()

        if (_.isEmpty(this.datasets)) return

        let bisector = d3.bisector(d => d.x).left
        let [x] = d3.mouse(this.selected.node())
        let actual = this.selectedXScale.invert(x)

        // Find potential closest
        // points to the cursor
        let potentials = []
        for (let i in this.datasets) {
          let {data} = this.datasets[i]
          let j = bisector(data, actual, 1)
          potentials.push({data: data[j], i})
          potentials.push({data: data[j - 1], i})
        }

        // Remove undefined data points
        potentials = potentials.filter(x => x.data != null)

        // Return if no points
        if (_.isEmpty(potentials)) return

        // Sort points by horizontal distance to cursor
        potentials = potentials.sort((a, b) => {
          let x0 = Math.abs(a.data.x - actual)
          let x1 = Math.abs(b.data.x - actual)
          return d3.descending(x1, x0)
        })

        let [closest] = potentials
        let caretX = this.selectedXScale(closest.data.x)

        // Only keep the data points with
        // the same commit as the closest
        potentials = potentials.filter(x => {
          return closest.data.commit === x.data.commit
        })

        // Clear previous rendition
        this.tooltip.selectAll('*').remove()

        // Append date and commit hash to tooltip
        this.hoveredCommit = closest.data.commit
        this.tooltip.append('p').text(this.props.dates[this.hoveredCommit].message)
        this.tooltip.append('p').text(formatTime(closest.data.x))
        this.tooltip.append('pre').text(this.hoveredCommit.slice(0, 14))

        // Create y-value / stdev table
        let table = this.tooltip.append('table')
        let header = table.append('tr')
        header.append('th').text('Value')
        header.append('th').text('Stdev')

        // Append data table
        for (let {data, i} of potentials) {
          let entry = table.append('tr')
            .style('color', `rgb(${this.datasets[i].color})`)
          entry.append('td').text(data.y.toFixed(3))
          entry.append('td').text(data.stdDev.toFixed(3))
        }

        let {width} = this.selected.node().getBoundingClientRect()
        let acrossMiddle = caretX > width / 2

        // Position caret
        this.caret.style('visibility', 'visible')
          .attr('x1', caretX)
          .attr('x2', caretX)

        // Position tooltip
        this.tooltip.style('visibility', 'visible')
          .classed('across-middle', acrossMiddle)
          .style('margin-left', caretX + 'px')
      })
      .on('mouseout', () => {
        this._resetTooltip()
      })
      .on('click', () => {
        // Open commit on GitHub on click
        if (this.hoveredCommit == null) return
        window.open(`${repoURL}/commit/${this.hoveredCommit}`)
      })

    // Cosmetic top line
    this.selected.append('line')
      .classed('domain', true)
      .attr('x2', '100%')

    // Append data point caret
    this.caret = this.selected.append('line')
      .classed('caret', true)
      .attr('y2', '100%')

    this.yLabel = this.selected.append('text')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('dy', '-4em')
      .attr('x', '-130')

    // Initialize x-overview
    this.overview = this.container.append('svg')
    this.overview.classed('x-overview', true)

    // Additional rescale drag handlers
    slider.on('drag', this._rescale)
    handle.on('drag', this._rescale)
    slider.on('end', this._updateURL)
    handle.on('end', this._updateURL)

    var sliderGroup = this.overview.append('g')

    // Append slider
    this.slider = sliderGroup.append('rect')
      .classed('slider', true)
      .attr('width', `${xRight - xLeft}%`)
      .attr('height', '100%')
      .attr('x', `${xLeft}%`)
      .call(slider)

    // Append west handle
    sliderGroup.append('rect')
      .classed('handle', true)
      .attr('width', '10')
      .attr('transform', 'translate(-5)')
      .attr('height', '100%')
      .attr('x', `${xLeft}%`)
      .call(handle)

    // Append east handle
    sliderGroup.append('rect')
      .classed('handle', true)
      .attr('width', '10')
      .attr('transform', 'translate(-5)')
      .attr('height', '100%')
      .attr('x', `${xRight}%`)
      .call(handle)

    // Initialize scales
    this.selectedXScale = d3.scaleTime()
    this.selectedYScale = d3.scaleLinear()
    this.overviewXScale = d3.scaleTime()
    this.overviewYScale = d3.scaleLinear()

    // Keep valueline within range
    this.selectedXScale.clamp(true)

    // Selected valueline
    this.selectedValueline = d3.line()
      .x(d => this.selectedXScale(d.x))
      .y(d => this.selectedYScale(d.y))

    // x-overview valueline
    this.overviewValueline = d3.line()
      .x(d => this.overviewXScale(d.x))
      .y(d => this.overviewYScale(d.y))

    // Standard deviation area
    this.stdDevArea = d3.area()
      .x(d => this.selectedXScale(d.x))
      .y0(d => this.selectedYScale(d.y - d.stdDev))
      .y1(d => this.selectedYScale(d.y + d.stdDev))

    // Initialize axes
    this.xAxis = this.selected.append('g')
    this.yAxis = this.selected.append('g')

    this.xAxis.classed('y-axis', true)
    this.yAxis.classed('x-axis', true)

    this.xComponent = d3.axisBottom(this.selectedXScale)
    this.yComponent = d3.axisLeft(this.selectedYScale)

    this.xComponent.tickSizeOuter(0)
    this.yComponent.tickSizeOuter(0)
    this.xComponent.tickPadding(8)
    this.yComponent.tickPadding(8)

    // Initialize graph containers
    this.selectedGraphs = this.selected.append('g')
    this.overviewGraphs = this.overview.append('g')

    // Clamp y-axis to height
    this.selected.append('defs')
      .append('clipPath')
      .attr('id', 'selected-clip')
      .append('rect')
      .attr('x', '-50%')
      .attr('width', '200%')
      .attr('height', '100%')
    this.selectedGraphs.attr('clip-path', 'url(#selected-clip)')

    // Size the chart
    this._resize()

    this.componentDidUpdate()
  }

  // Render via d3
  componentDidUpdate() {
    this._clear()

    let {yMax, type, selected} = this.props
    let datasets = extract(this.props)

    // Apply slowdown processing
    if (type === 'slowdown') {
      datasets = slowdown(datasets)
    }

    // Apply colors to datasets
    for (let i in datasets) {
      let dataset = datasets[i]
      if (dataset == null) continue
      this.datasets.push({
        data: dataset,
        color: selected[i].color
      })
    }

    if (_.isEmpty(this.datasets)) return

    // Combine datasets into one
    datasets = this.datasets.map(x => x.data)
    let combined = _.flatten(datasets)

    // Find domain of all data
    let xDomain = d3.extent(combined, d => d.x)
    let yDomain = [1, d3.max(combined, d => d.y)]

    // Set new domains
    this.overviewXScale.domain(xDomain)
    this.overviewYScale.domain(yDomain)

    // TODO: Make yMax 0 - 1
    // and independent of slowdown
    if (type === 'slowdown') {
      yDomain[1] = Math.min(yDomain[1], +yMax)
      this.yLabel.text('Times slower than fastest')
    } else {
      this.yLabel.text('Benchmark runtime (ms)')
    }

    this.selectedXScale.domain(xDomain)
    this.selectedYScale.domain(yDomain)

    // Redraw axes
    this.xAxis.call(this.xComponent)
    this.yAxis.call(this.yComponent)

    for (let dataset of this.datasets) {
      let {data, color} = dataset

      // Create paths for the dataset
      let stdDevPath = this.selectedGraphs.append('path')
      let selectedPath = this.selectedGraphs.append('path')
      let overviewPath = this.overviewGraphs.append('path')

      stdDevPath.classed('area', true)
      selectedPath.classed('graph', true)
      overviewPath.classed('graph', true)

      stdDevPath.attr('d', this.stdDevArea(data))
      selectedPath.attr('d', this.selectedValueline(data))
      overviewPath.attr('d', this.overviewValueline(data))

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
      <div className='graph-container'>
        <Button onClick={this._saveGraph} shape="circle" className="save-graph">
           <Icon type="save" />
        </Button>
        <ReactResizeDetector handleWidth handleHeight onResize={this._resize}/>
      </div>
    )
  }

  _updateURL = () => {
    let x = parseFloat(this.slider.attr('x'))
    let width = parseFloat(this.slider.attr('width'))
    this.props.changeGraphZoom(Math.round(x), Math.round(x + width))
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
      selectedPath.attr('d', this.selectedValueline(data))
    }

    // Redraw axes
    this.xAxis.call(this.xComponent)
    this.yAxis.call(this.yComponent)
  }

  // Resize the chart to the
  // size of the container
  _resize = () => {
    // Get dimensions
    let selectedRect = this.selected.node().getBoundingClientRect()
    let overviewRect = this.overview.node().getBoundingClientRect()

    // Resize axes
    this.selectedXScale.range([0, selectedRect.width])
    this.selectedYScale.range([selectedRect.height, 0])
    this.overviewXScale.range([0, overviewRect.width])
    this.overviewYScale.range([overviewRect.height, 0])

    // Recalculate tick amount. The value doesn't translate
    // directly to the amount of ticks since D3 decides
    let xTicks = Math.max(2, selectedRect.width / 100)
    let yTicks = Math.max(2, selectedRect.height / 30)

    this.xComponent.ticks(xTicks)
    this.yComponent.ticks(yTicks)

    // Update tick line width / height
    this.xComponent.tickSizeInner(-selectedRect.height)
    this.yComponent.tickSizeInner(-selectedRect.width)

    // Move x-axis to the bottom
    this.xAxis.attr('transform', `translate(0,${selectedRect.height})`)

    // Redraw axes
    this.xAxis.call(this.xComponent)
    this.yAxis.call(this.yComponent)

    // Resize graph paths
    for (let dataset of this.datasets) {
      let {data, stdDevPath, selectedPath, overviewPath} = dataset
      stdDevPath.attr('d', this.stdDevArea(data))
      selectedPath.attr('d', this.selectedValueline(data))
      overviewPath.attr('d', this.overviewValueline(data))
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

  _resetTooltip = () => {
    this.hoveredCommit = null
    this.caret.style('visibility', 'hidden')
    this.tooltip.style('visibility', 'hidden')
  }

  _saveGraph = () => {
    const rect = this.selected.node().getBoundingClientRect()
    saveSvgAsPng.saveSvgAsPng(this.selected.node(), 'futhark-benchmarks.png', {
      left: -100,
      top: -20,
      width: rect.width + 125,
      height: rect.height + 50,
      backgroundColor: 'white'
    });
  }
}

export default D3Graph
