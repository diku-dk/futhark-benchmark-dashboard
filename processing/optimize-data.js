const fs = require('fs')
const _ = require('lodash')

const optimizeBenchmarks = (input, diffThreshold, commitData) => {
  for (const backendKey in input) {
    const backend = input[backendKey]
    let filteredBackend = {}

    for (const machineKey in backend) {
      const machine = backend[machineKey]
      const sortedCommitKeys = Object.keys(machine).sort((a, b) => {
        return new Date(commitData[a].date) - new Date(commitData[b].date)
      })
      const reversedSortedCommitKeys = sortedCommitKeys.slice().reverse()

      const filterCommits = (commitKeys) => {
        let lastInserted = {}

        for (const commitKey of commitKeys) {
          const commit = machine[commitKey]

          for (const benchmarkKey in commit) {
            const benchmark = commit[benchmarkKey]

            for (const datasetKey in benchmark['datasets']) {
              const dataset = benchmark['datasets'][datasetKey]

              if (_.get(lastInserted, [benchmarkKey, datasetKey], false)) {
                const previousDataset = _.get(lastInserted, [benchmarkKey, datasetKey], false)

                const diff = Math.abs((previousDataset.avg - dataset.avg) / previousDataset.avg)

                if (diff < diffThreshold) {
                  continue
                }
              }

              _.set(lastInserted, [benchmarkKey, datasetKey], dataset)
              _.set(filteredBackend, [machineKey, commitKey, benchmarkKey, 'datasets', datasetKey], dataset)
            }
          }
        }
      }

      filterCommits(sortedCommitKeys)
      filterCommits(reversedSortedCommitKeys)
    }

    input[backendKey] = filteredBackend
  }

  return input
}

module.exports = {optimizeBenchmarks}
