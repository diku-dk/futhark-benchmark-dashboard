const fs = require('fs')
var _ = require('lodash')

function compare (a, b) {
  if (a.diff < b.diff) { return -1 }
  if (a.diff > b.diff) { return 1 }
  return 0
}

const dashboard = (commits, data) => {
  const sortedCommitKeys = Object.keys(commits).sort((a, b) => {
    return new Date(commits[a].date) - new Date(commits[b].date)
  })

  const secondNewestCommitKey = sortedCommitKeys[sortedCommitKeys.length - 2]
  const newestCommitKey = sortedCommitKeys[sortedCommitKeys.length - 1]

  let scores = []

  for (const backendKey in data) {
    const backend = data[backendKey]

    for (const machineKey in backend) {
      const machine = backend[machineKey]

      if (machine[newestCommitKey] == null || machine[secondNewestCommitKey] == null) {
        continue
      }

      const secondNewestCommit = machine[secondNewestCommitKey]
      const newestCommit = machine[newestCommitKey]

      for (const benchmarkKey in newestCommit) {
        const benchmark = newestCommit[benchmarkKey]

        for (const datasetKey in benchmark['datasets']) {
          const dataset = benchmark['datasets'][datasetKey]

          if (_.get(secondNewestCommit, [benchmarkKey, 'datasets', datasetKey])) {
            const secondNewestDataset = _.get(secondNewestCommit, [benchmarkKey, 'datasets', datasetKey])
            const diff = (secondNewestDataset['avg'] - dataset['avg']) / secondNewestDataset['avg'] * 100

            scores.push({
              diff,
              benchmark: benchmarkKey,
              machine: machineKey,
              backend: backendKey,
              dataset: datasetKey,
              commit: newestCommitKey,
              before: secondNewestCommitKey,
              key: [machineKey, backendKey, benchmarkKey, datasetKey].join('-')
            })
          }
        }
      }
    }
  }

  const positive = scores.filter(a => a.diff >= 0).sort(compare).reverse()
  const negative = scores.filter(a => a.diff < 0).sort(compare)

  const topScores = positive.slice(0, Math.min(positive.length, 10))
  const bottomScores = negative.slice(0, Math.min(negative.length, 10))

  return {
    topScores,
    bottomScores
  }
}

module.exports = {dashboard}
