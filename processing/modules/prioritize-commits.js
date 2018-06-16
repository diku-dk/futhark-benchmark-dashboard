const fs = require('fs')
const _  = require('lodash')

// Find absolute relative change as
// neper (Np) between `v1` and `v2`.
const neperChange = (v1, v2) => {
  return Math.abs(Math.log(v1 / v2))
}

// Prioritize commits by benchmark and dataset.
const differences = (result, commits) => {
  let priors = {}
  _.each(commits, ([hash, benchmarks]) => {
    _.each(benchmarks, ({datasets}, i) => {
      _.each(datasets, ({avg}, j) => {
        let index = [i, j]
        let prior = _.get(priors, index, null)
        _.set(priors, index, {avg, hash})

        if (prior == null || prior.avg === avg) return

        let change = neperChange(avg, prior.avg)
        result[hash][0].push(change)
        result[prior.hash][1].push(change)
      })
    })
  })
}

// Prioritize commits by difference w/ all backend,
// machine, benchmark, and dataset combinations.
const prioritize = (backends, commits, options) => {
  let {maxRevisions = Infinity} = options || {}
  let result = _.mapValues(commits, () => [[], []])
  let dates  = _.mapValues(commits, x => new Date(x.date))

  _.each(backends, machines => {
    _.each(machines, revisions => {
      revisions = _.entries(revisions)
      revisions.sort(([a], [b]) => dates[a] - dates[b])
      differences(result, revisions)
    })
  })

  // Process the differences.
  return _.entries(result)
    .map(x => [x[0], _.max(x[1].map(_.sum))])
    .sort((a, b) => dates[b[0]] - dates[a[0]])
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxRevisions)
    .map(x => x[0])
}

module.exports = {prioritize}
