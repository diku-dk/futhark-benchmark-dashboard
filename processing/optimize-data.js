const fs = require('fs')
const _ = require('lodash')

const optimizeBenchmarks = (input, diffThreshold, commitDates) => {
  for (const backendKey in input) {
    const backend = input[backendKey]

    let filteredBackend = {}

    for (const machineKey in backend) {
      const machine = backend[machineKey]

      const sortedCommitKeys = Object.keys(machine).sort((a, b) => {
        return new Date(commitDates[a]) - new Date(commitDates[b])
      })

      const reversedSortedCommitKeys = sortedCommitKeys.reverse()

      const filterCommits = (commitKeys) => {
        let lastInserted = {}
        let lastInsertedDatasetCommitKey = {}
        let lastNotInserted = {}
        let lastNotInsertedDatasetCommitKey = {}

        for (const commitKey of commitKeys) {
          const commit = machine[commitKey]

          for (const benchmarkKey in commit) {
            const benchmark = commit[benchmarkKey]

            for (const datasetKey in benchmark['datasets']) {
              const dataset = benchmark['datasets'][datasetKey]
              const lastNotInsertedDataset = _.get(lastNotInserted, [benchmarkKey, datasetKey], false)
              const lastNotInsertedCommitKey = _.get(lastNotInsertedDatasetCommitKey, [benchmarkKey, datasetKey], false)

              if (_.get(lastInserted, [benchmarkKey, datasetKey], false)) {
                const previousDataset = _.get(lastInserted, [benchmarkKey, datasetKey], false)

                const diff = Math.abs((previousDataset['avg'] - dataset['avg']) / previousDataset['avg'])

                if ( diff < diffThreshold) {
                  if ( _.get(lastInsertedDatasetCommitKey, [benchmarkKey, datasetKey], false) == lastNotInsertedCommitKey ) {
                    _.set(filteredBackend, [machineKey, commitKey, benchmarkKey, 'datasets', datasetKey], dataset)
                  }

                  _.set(lastNotInserted, [benchmarkKey, datasetKey], dataset)
                  _.set(lastNotInsertedDatasetCommitKey, [benchmarkKey, datasetKey], commitKey)
                  continue
                }
              }

              _.set(lastInserted, [benchmarkKey, datasetKey], dataset)
              _.set(lastInsertedDatasetCommitKey, [benchmarkKey, datasetKey], commitKey)
              _.set(filteredBackend, [machineKey, commitKey, benchmarkKey, 'datasets', datasetKey], dataset)

              if (lastNotInsertedDataset && lastNotInsertedCommitKey) {
                _.set(filteredBackend, [machineKey, lastNotInsertedCommitKey , benchmarkKey, 'datasets', datasetKey], lastNotInsertedDataset)
              }
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

// If this script was executed directly
if (require.main === module) {
  if (process.argv[2] == null) {
    console.log("Please run: optimize-data.js <input file>")
    process.exit()
  }

  const commitDates = require('./out/commits.json')
  const inputData = JSON.parse(fs.readFileSync(process.argv[2]))
  const optimized = optimizeBenchmarks(inputData, 0.02, commitDates)

  fs.writeFileSync('./out/optimized.json', JSON.stringify(optimized))
}

module.exports = {optimizeBenchmarks}