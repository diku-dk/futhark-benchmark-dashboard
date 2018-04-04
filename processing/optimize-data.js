const fs = require('fs')
const commits = require('./out/commits.json')
var _ = require('lodash')

if (process.argv[2] == null) {
  console.log("Please run: optimize-data.js <input file>")
  process.exit()
}

const inputData = JSON.parse(fs.readFileSync(process.argv[2]))

function optimizeGeneral( input ) {
  for (const backendKey in input) {
    const backend = input[backendKey]

    for (const machineKey in backend) {
      const machine = backend[machineKey]
      
      const sortedCommitKeys = Object.keys(machine).sort((a, b) => {
        return new Date(commits[a]) - new Date(commits[b])
      })

      let filteredMachine = {}
      let previousInsertedCommit = null

      for (const commitKey of sortedCommitKeys) {
        const commit = machine[commitKey]
        let qualifies = false

        // TODO: fix edge case where benchmarks are different

        if (previousInsertedCommit == null) {
          previousInsertedCommit = commit
          filteredMachine[commitKey] = commit
          continue
        }

        for (const benchmarkKey in commit) {
          const benchmark = commit[benchmarkKey]

          if (qualifies)
            break

          if (!(benchmarkKey in previousInsertedCommit)) {
            qualifies = true
            break
          }

          const previousBenchmark = previousInsertedCommit[benchmarkKey]

          for (const datasetKey in benchmark['datasets']) {
            const currentDataset = commit[benchmarkKey]['datasets'][datasetKey]

            if (!(datasetKey in previousBenchmark['datasets'])) {
              qualifies = true
              break
            }

            const previousDataset = previousBenchmark['datasets'][datasetKey]
            const diff = Math.abs((previousDataset['avg'] - currentDataset['avg']) / previousDataset['avg'])

            if (diff > 0.10) {
              qualifies = true
              break
            }
          }
        }

        if (qualifies) {
          previousInsertedCommit = commit
          filteredMachine[commitKey] = commit
        }
      }

      backend[machineKey] = filteredMachine
    }
  }

  return input
}

function optimizeBenchmarks( input ) {
  for (const backendKey in input) {
    const backend = input[backendKey]

    let filteredBackend = {}
    let lastBackend = {}
    let lastBackendReconstruct = {}

    for ( const machineKey in backend ) {
      const machine = backend[machineKey]

      const sortedCommitKeys = Object.keys(machine).sort((a, b) => {
        return new Date(commits[a]) - new Date(commits[b])
      })

      const reversedSortedCommitKeys = sortedCommitKeys.reverse()

      const filterCommits = (commitKeys) => {
        let previous = {}

        for (const commitKey of commitKeys) {
          const commit = machine[commitKey]

          for (const benchmarkKey in commit) {
            const benchmark = commit[benchmarkKey]

            for (const datasetKey in benchmark['datasets']) {
              const dataset = benchmark['datasets'][datasetKey]

              if ( _.get(previous, [benchmarkKey, datasetKey], false) ) {
                const previousDataset = _.get(previous, [benchmarkKey, datasetKey], false)

                const diff = Math.abs((previousDataset['avg'] - dataset['avg']) / previousDataset['avg'])

                if ( diff < 0.05 ) {
                  _.set(lastBackend, [machineKey, benchmarkKey, 'datasets', datasetKey], Object.assign({commit: commitKey}, dataset))
                  continue
                }
              }

              _.set(previous, [benchmarkKey, datasetKey], dataset)
              _.set(filteredBackend, [machineKey, commitKey, benchmarkKey, 'datasets', datasetKey], dataset)
            }
          }
        }
      }

      filterCommits(sortedCommitKeys)
      filterCommits(reversedSortedCommitKeys)
    }

    input[backendKey] = _.merge(filteredBackend, lastBackendReconstruct)
  }

  return input
}

const optimized = optimizeBenchmarks(inputData)

const json = JSON.stringify(optimized)
fs.writeFileSync('./out/optimized.json', json)
