const fs = require('fs')
const _  = require('lodash')

// Prioritize commits by benchmark and dataset.
const differences = (result, commits) => {
  let priors = {}
  _.each(commits, ([hash, benchmarks]) => {
    _.each(benchmarks, ({datasets}, i) => {
      _.each(datasets, ({avg}, j) => {
        let index = [i, j]
        let prior = _.get(priors, index)
        _.set(priors, index, avg)

        if (!prior) return

        let difference = (prior - avg) / prior
        result[hash].push(Math.abs(difference))
      })
    })
  })
}

// Prioritize commits by difference w/ all backend,
// machine, benchmark, and dataset combinations.
const prioritize = (backends, commits, options) => {
  let {maxRevisions = Infinity} = options || {}
  let result = _.mapValues(commits, () => [])
  let dates  = _.mapValues(commits, x => new Date(x.date))

  _.each(backends, machines => {
    _.each(machines, revisions => {
      revisions = _.entries(revisions)
      revisions.sort(([a], [b]) => dates[a] - dates[b])

      // Find differences forwards and backwards.
      differences(result, revisions)
      differences(result, revisions.reverse())
    })
  })

  // Process the differences.
  return _.entries(result)
    .map(x => x[1] = _.sum(x[1]))
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxRevisions)
    .map(x => x[0])
}

if (require.main == module) {
  let combined = require('./out/combined.json')
  let commits  = require('./out/commits.json')
  let [,, name, maxRevisions] = process.argv
  let out = prioritize(combined, commits, {maxRevisions})
  fs.writeFileSync(name + '.txt', out.join('\n'))
}

module.exports = {prioritize}
