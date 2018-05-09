
// Generic slider drag
var slider = d3.drag()
  .on('start', function() {
    d3.event.sourceEvent.stopPropagation()
  })
  .on('drag.move', function() {
    // Horizontal movement only
    var {dx, x} = d3.event
    if (dx == 0) return

    // Get parent SVG & its dimensions
    var top = this.parentNode.parentNode
    var {width} = top.getBoundingClientRect()
    var parent = d3.select(top)

    // Inside range only
    if (x < 0 || x > width) return

    // Get slider
    var s = d3.select(this)

    // Calulate new offsets
    var dx = 100 * dx / width
    var s_x = parseFloat(s.attr('x'))
    var s_w = parseFloat(s.attr('width'))
    s_x = Math.max(Math.min(s_x + dx, 100 - s_w), 0)

    // Reset offset
    s.attr('x', s_x + '%')

    // Move handles
    parent.selectAll('.handle')
      .attr('x', function(_, i) {
        return s_x + i * s_w + '%'
      })
  })

// Generic handle drag
var handle = d3.drag()
  .on('start', function() {
    d3.event.sourceEvent.stopPropagation()
  })
  .on('drag', function() {
    // Horizontal movement only
    var {dx, x} = d3.event
    if (dx == 0) return

    // Get parent SVG & its dimensions
    var top = this.parentNode.parentNode
    var {width} = top.getBoundingClientRect()
    var parent = d3.select(top)

    // Get slider & handles
    var s = parent.select('.slider')
    var h0 = d3.select(this).classed('selected', true)
    var h1 = parent.select('.handle:not(.selected)')
    h0.classed('selected', false)

    // Calculate new offsets & slider width
    var x = 100 * x / width
    var h1_x = parseFloat(h1.attr('x'))
    var h0_x = Math.max(Math.min(x, 100), 0)
    var s_x = h0_x >= h1_x ? h1_x : h0_x
    var s_w = Math.abs(h0_x - h1_x)

    // Reset attributes
    s.attr('width', s_w + '%');
    s.attr('x', s_x + '%');
    h0.attr('x', h0_x + '%');
  })

class Chart {
  constructor(at) {
    this.datasets = []

    // Color scheme for graphs
    this.scheme = d3.schemeDark2.slice(0)

    // Initialize selection view
    this.container = d3.select(at)
    this.selection = this.container.append('svg')
    this.selection.classed('selected', true)

    // Initialize x-overview
    this.x_overview = this.container.append('svg')
    this.x_overview.classed('x-overview', true)

    // Additional rescale drag handler
    slider.on('drag.rescale', this._sl_x_rescale.bind(this))
    handle.on('drag.rescale', this._sl_x_rescale.bind(this))

    // Slider group
    var g = this.x_overview.append('g')

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

    // Append borders (cosmetic)
    g.append('line')
      .attr('y2', '100%')

    g.append('line')
      .attr('y2', '100%')
      .attr('x1', '100%')
      .attr('x2', '100%')

    // Initialize scales
    this.s_x_scale = d3.scaleTime()
    this.s_y_scale = d3.scaleLinear()
    this.o_x_scale = d3.scaleTime()
    this.o_y_scale = d3.scaleLinear()

    // Keep valueline within range
    this.s_x_scale.clamp(true)
    this.s_y_scale.clamp(true)

    // Selected valueline
    this.s_valueline = d3.line()
      .x(d => this.s_x_scale(d.x))
      .y(d => this.s_y_scale(d.y))

    // x-overview valueline
    this.o_valueline = d3.line()
      .x(d => this.o_x_scale(d.x))
      .y(d => this.o_y_scale(d.y))

    // Initialize axes
    this.x_axis = this.selection.append('g')
    this.y_axis = this.selection.append('g')

    this.x_axis.classed('y-axis', true)
    this.y_axis.classed('x-axis', true)

    this.x_component = d3.axisBottom(this.s_x_scale)
    this.y_component = d3.axisLeft(this.s_y_scale)

    this.x_component.tickSizeOuter(0)
    this.y_component.tickSizeOuter(0)

    this.x_component.tickPadding(8)
    this.y_component.tickPadding(8)

    // Initialize graph containers
    this.s_graphs = this.selection.append('g')
    this.o_graphs = this.x_overview.append('g')

    // Size the chart
    this._resize()

    // Make elements responsive
    d3.select(window).on('resize', this._resize.bind(this))

    // Make hidden 'til there's something to show
    // this.container.style('visibility', 'hidden')
  }

  // Resize the chart to the
  // size of the container
  _resize() {
    var element = this.selection.node()
    var rect = element.getBoundingClientRect()
    var o_h = parseFloat(this.x_overview.style('height'))

    // Resize axes
    this.s_x_scale.range([0, rect.width])
    this.s_y_scale.range([rect.height, 0])
    this.o_x_scale.range([0, rect.width])
    this.o_y_scale.range([o_h, 0])

    // Recalculate tick amount. The value
    // doesn't translate directly to the
    // amount of ticks since d3 decides
    var x_ticks = Math.max(2, rect.width / 100)
    var y_ticks = Math.max(2, rect.height / 30)

    this.x_component.ticks(x_ticks)
    this.y_component.ticks(y_ticks)

    // Update tick line width / height
    this.x_component.tickSizeInner(-rect.height)
    this.y_component.tickSizeInner(-rect.width)

    // Move x-axis to the bottom
    this.x_axis.attr('transform', 'translate(0,' + rect.height + ')')

    // Redraw axes
    this.x_axis.call(this.x_component)
    this.y_axis.call(this.y_component)

    // Resize graphs
    for (var dataset of this.datasets)
    {
      var {data, s_path, o_path} = dataset
      s_path.attr('d', this.s_valueline(data))
      o_path.attr('d', this.o_valueline(data))
    }
  }

  // Rescale based on the dimensions
  // of the x-overview slider
  _sl_x_rescale() {
    var sl_x = parseFloat(this.slider.attr('x'))
    var sl_w = parseFloat(this.slider.attr('width'))
    this._x_rescale(sl_x, sl_x + sl_w)
  }

  // Rescale the x-axis. Doesn't
  // rescale the slider
  _x_rescale(from, to) {
    from /= 100
    to /= 100

    // TODO: Fix dis mess
    var x1 = new Date(this.full_domain_x[0]).getTime()
    var x2 = new Date(this.full_domain_x[1]).getTime()

    x2 = new Date(x1 + to * (x2 - x1))
    x1 = new Date(x1 + from * (x2 - x1))

    var domain = [x1, x2]

    this.s_x_scale.domain(domain)

    // Redraw graphs
    for (var dataset of this.datasets)
    {
      var {data, s_path} = dataset
      s_path.attr('d', this.s_valueline(data))
    }

    // Redraw axes
    this.x_axis.call(this.x_component)
    this.y_axis.call(this.y_component)
  }

  // Rescale x-axis and slider
  x_rescale(from, to) {
    // TODO
  }

  // Rescale y-axis
  y_rescale(from, to) {
    // TODO
  }

  display(data) {
    // TODO: remove conversion on client-side
    var data = data.x.map(function(e, i) {
      return {
        x: d3.isoParse(e),
        y: data.y[i],
        dev: data.yDev[i],
        hash: data.xCommits[i]
      }
    })

    var x_domain = d3.extent(data, function(d) { return d.x; })
    var y_domain = [0, d3.max(data, function(d) { return d.y; })]

    // Match with previous domain
    // this.x_domain = [Math.min(this.x_domain[0], x_domain[0]), Math.max(this.x_domain[1], x_domain[1])]
    // TODO: Calculate full domain
    this.full_domain_x = x_domain

    // Expand / set new domain
    this.s_x_scale.domain(x_domain)
    this.s_y_scale.domain(y_domain)
    this.o_x_scale.domain(x_domain)
    this.o_y_scale.domain(y_domain)

    // Redraw axes
    this.x_axis.call(this.x_component)
    this.y_axis.call(this.y_component)

    // Create paths and insert data
    var s_path = this.s_graphs.append('path')
    var o_path = this.o_graphs.append('path')

    s_path.classed('graph', true)
    o_path.classed('graph', true)

    s_path.attr('d', this.s_valueline(data))
    o_path.attr('d', this.o_valueline(data))

    var colour = this.scheme.shift()

    if (colour) {
      // Set graph colour
      s_path.style('stroke', colour)
      o_path.style('stroke', colour)
    }

    // Return index
    var dataset = {s_path, o_path, data}
    return this.datasets.push(dataset) - 1
  }

  remove(index) {
    var {s_path, o_path} = this.datasets[index]

    // Make the colour available again
    var colour = s_path.style('stroke')
    if (colour) this.scheme.push(colour)

    // Remove graphs
    s_path.remove()
    o_path.remove()

    // Remove dataset entry
    this.datasets.splice(index, 1)
  }
}
