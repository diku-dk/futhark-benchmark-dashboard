import _ from 'lodash'

// Extract data points sorted by date
let extract = ({selected, data, dates}) => {
  // Get datasets for selected paths
  return selected.map(path => {
    // Is selected path complete?
    if (path.dataset == null) return null

    let {backend, machine, benchmark, dataset} = path
    let at = [benchmark, 'datasets', dataset]
    let commits = data[backend][machine]

    return _.map(commits, (benchmarks, commit) => {
      let d = _.get(benchmarks, at, null)
      if (d == null) return null

      d = _.clone(d)
      d.commit = commit
      d.x = new Date(dates[commit])
      d.y = d.avg

      delete d.avg
      return d
    })
    .filter(d => d != null)
    .sort((a, b) => a.x - b.x)
  })
}

export {extract}
