const fs = require('fs')
const commits = require('./out/commits.json')

if (process.argv[2] == null) {
  console.log("Please run: optimize-data.js <input file>")
  process.exit()
}

const inputData = JSON.parse(fs.readFileSync(process.argv[2]))

for (const backendKey in inputData) {
  const backend = inputData[backendKey]

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

const json = JSON.stringify(inputData)
fs.writeFileSync('./out/optimized.json', json)
