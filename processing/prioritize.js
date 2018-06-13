const fs = require('fs')
const _  = require('lodash')

// Find percentage increase between `v1` and `v2`
const percentageChange = (v1, v2) => {
  return Math.abs((v1 - v2) / v1)
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

        let forward = percentageChange(prior.avg, avg)
        let reverse = percentageChange(avg, prior.avg)
        result[hash][0].push(forward)
        result[prior.hash][1].push(reverse)
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

// node prioritize.js <out_name> <max_revisions>
if (require.main == module) {
  let combined = require('./out/combined.json')
  let commits  = require('./out/commits.json')
  let [,, name = 'out', maxRevisions] = process.argv
  let out = prioritize(combined, commits, {maxRevisions})
  fs.writeFileSync(name + '.txt', out.join('\n'))
}

module.exports = {prioritize}
