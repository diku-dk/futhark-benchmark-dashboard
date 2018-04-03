const fs = require('fs');
const glob = require("glob")
const zlib = require('zlib')
var _ = require('lodash')

const benchmarkResultsFolder = './benchmark-results'

const files = glob.sync("*.json", {
  cwd: benchmarkResultsFolder
})

const commits = require('./out/commits.json')

const largeObject = {}

const metadata = {
  skeleton: {},
  commits: commits,
  benchmarks: [],
}

Promise.all(files.map(file => {
  return new Promise((resolve, reject) => {
    const [backend, machine, commit] = file.replace('.json', '').split('-').splice(1)

    if (!(backend in largeObject))
      largeObject[backend] = {}

    if (!(machine in largeObject[backend]))
      largeObject[backend][machine] = {}

    resolve([file, backend, machine, commit])
  })
})).then(results => {
  metadata.skeleton = JSON.parse(JSON.stringify(largeObject))

  return Promise.all(results.map(([file, backend, machine, commit]) => {
    return new Promise((resolve, reject) => {
      if (!commit in commits)
        return resolve()

      const data = require(`${benchmarkResultsFolder}/${file}`)

      for (const benchmarkKey in data) {
        metadata.benchmarks.push(benchmarkKey)

        const benchmark = data[benchmarkKey]
        if (!('datasets' in benchmark) || Object.keys(benchmark['datasets']).length == 0) {
          delete data[benchmarkKey]
          continue
        }

        for (const datasetKey in benchmark['datasets']) {
          const dataset = benchmark['datasets'][datasetKey]
          const runtimes = dataset['runtimes']
          if (runtimes === undefined) {
            delete benchmark['datasets'][datasetKey]
            continue
          }

          delete dataset['runtimes']
          dataset['avg'] = Math.round(average(runtimes))
          dataset['stdDev'] = Math.round(standardDeviation(runtimes))
        } 
      }
      
      largeObject[backend][machine][commit] = data
      resolve()
    })
  }))
}).then(results => {
  const json = JSON.stringify(largeObject)
  fs.writeFileSync('./out/combined.json', json)
  fs.writeFileSync('./out/combined.json.gz', zlib.gzipSync(json))

  metadata.benchmarks = _.uniq(metadata.benchmarks)

  fs.writeFileSync('./out/metadata.json', JSON.stringify(metadata))

}).then(results => {
  console.log("Done! :)")
})

const average = (data) => data.reduce((sum, value) => sum + value, 0) / data.length

const standardDeviation = (values) => {
  const avg = average(values)
  return Math.sqrt(average(values.map((value) => {
    const diff = value - avg
    return diff * diff
  })))
}
