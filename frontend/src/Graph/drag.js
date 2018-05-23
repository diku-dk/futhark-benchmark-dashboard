import * as d3 from 'd3'

// Generic slider drag
let slider = d3.drag()
  .on('start', () => {
    d3.event.sourceEvent.stopPropagation()
  })
  .on('drag.move', () => {
    // Horizontal movement only
    let {dx, x} = d3.event
    if (dx === 0) return

    // Get parent SVG & its dimensions
    let top = this.parentNode.parentNode
    let {width} = top.getBoundingClientRect()
    let parent = d3.select(top)

    // Inside range only
    if (x < 0 || x > width) return

    // Get slider
    let s = d3.select(this)

    // Calulate new offsets
    dx = 100 * dx / width
    let s_x = parseFloat(s.attr('x'))
    let s_w = parseFloat(s.attr('width'))
    s_x = Math.max(Math.min(s_x + dx, 100 - s_w), 0)

    // Reset offset
    s.attr('x', s_x + '%')

    // Move handles
    parent.selectAll('.handle')
      .attr('x', (_, i) => (s_x + i * s_w) + '%')
  })

// Generic handle drag
let handle = d3.drag()
  .on('start', () => {
    d3.event.sourceEvent.stopPropagation()
  })
  .on('drag.move', () => {
    // Horizontal movement only
    let {dx, x} = d3.event
    if (dx === 0) return

    // Get parent SVG & its dimensions
    let top = this.parentNode.parentNode
    let {width} = top.getBoundingClientRect()
    let parent = d3.select(top)

    // Get slider & handles
    let s = parent.select('.slider')
    let h0 = d3.select(this).classed('d3-selected', true)
    let h1 = parent.select('.handle:not(.d3-selected)')
    h0.classed('d3-selected', false)

    // Calculate new offsets & slider width
    x = 100 * x / width
    let h1_x = parseFloat(h1.attr('x'))
    let h0_x = Math.max(Math.min(x, 100), 0)
    let s_x = h0_x >= h1_x ? h1_x : h0_x
    let s_w = Math.abs(h0_x - h1_x)

    // Reset attributes
    s.attr('width', s_w + '%');
    s.attr('x', s_x + '%');
    h0.attr('x', h0_x + '%');
  })

export {slider, handle}
