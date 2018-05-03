const fs = require('fs')
const commits = require('./out/commits.json')
var _ = require('lodash')

if (process.argv[2] == null) {
  console.log("Please run: dashboard.js <input file>")
  process.exit()
}

function compare(a,b) {
  if (a.diff < b.diff)
    return -1;
  if (a.diff > b.diff)
    return 1;
  return 0;
}

const sortedCommitKeys = Object.keys(commits).sort((a, b) => {
  return new Date(commits[a]) - new Date(commits[b])
})
const secondNewestCommitKey = sortedCommitKeys[sortedCommitKeys.length - 2]
const newestCommitKey = sortedCommitKeys[sortedCommitKeys.length - 1]

const input = JSON.parse(fs.readFileSync(process.argv[2]))

let scores = []

for (const backendKey in input) {
  const backend = input[backendKey]

  for ( const machineKey in backend ) {
    const machine = backend[machineKey]

    if (  machine[newestCommitKey] == null || machine[secondNewestCommitKey] == null )
      continue

    const secondNewestCommit = machine[secondNewestCommitKey]
    const newestCommit = machine[newestCommitKey]

    for (const benchmarkKey in newestCommit) {
      const benchmark = newestCommit[benchmarkKey]

      for (const datasetKey in benchmark['datasets']) {
        const dataset = benchmark['datasets'][datasetKey]

        if ( _.get(secondNewestCommit, [benchmarkKey, 'datasets', datasetKey]) ) {
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
            key: [machineKey, backendKey, benchmarkKey, datasetKey].join("-")
          })
        }
      }
    }
  }
}

const scoresSorted = scores.sort(compare)
const topScores = scoresSorted.slice(Math.max(scoresSorted.length - 10, 1)).reverse()
const bottomScores = scoresSorted.slice(0, 10)

let dashboard = {
  topScores,
  bottomScores
}

const json = JSON.stringify(dashboard)
fs.writeFileSync('./out/dashboard.json', json)
