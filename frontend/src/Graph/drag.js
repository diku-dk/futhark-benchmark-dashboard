import * as d3 from 'd3'

// Generic slider drag
let slider = d3.drag()
  .on('start', function() {
    d3.event.sourceEvent.stopPropagation()
  })
  .on('drag.move', function() {
    // Horizontal movement only
    var {dx, x} = d3.event
    if (dx === 0) return

    // Get parent SVG & its dimensions
    var top = this.parentNode.parentNode
    var {width} = top.getBoundingClientRect()
    var parent = d3.select(top)

    // Inside range only
    if (x < 0 || x > width) return

    // Get slider
    var s = d3.select(this)

    // Calulate new offsets
    dx = 100 * dx / width
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
let handle = d3.drag()
  .on('start', function() {
    d3.event.sourceEvent.stopPropagation()
  })
  .on('drag.move', function() {
    // Horizontal movement only
    var {dx, x} = d3.event
    if (dx === 0) return

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
    x = 100 * x / width
    var h1_x = parseFloat(h1.attr('x'))
    var h0_x = Math.max(Math.min(x, 100), 0)
    var s_x = h0_x >= h1_x ? h1_x : h0_x
    var s_w = Math.abs(h0_x - h1_x)

    // Reset attributes
    s.attr('width', s_w + '%');
    s.attr('x', s_x + '%');
    h0.attr('x', h0_x + '%');
  })

export {slider, handle}
