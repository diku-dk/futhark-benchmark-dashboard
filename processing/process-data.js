const fs = require('fs')
const glob = require('glob')
var _ = require('lodash')
const settings = require('./settings.json')

const benchmarkResultsFolder = './benchmark-results'

const files = glob.sync('*.json', {
  cwd: benchmarkResultsFolder
})

const commits = require('./out/commits.json')

const largeObject = {}

const metadata = {
  skeleton: {},
  commits: commits,
  benchmarks: {}
}

Promise.all(files.map(file => {
  return new Promise((resolve, reject) => {
    const [backend, machine, commit] = file.replace('.json', '').split('-').splice(1)

    if (!(backend in largeObject) && _.get(settings, ['whitelist', backend])) {
      largeObject[backend] = {}
    }

    if (!(machine in largeObject[backend]) && _.get(settings, ['whitelist', backend, machine])) {
      largeObject[backend][machine] = {}
    }

    resolve([file, backend, machine, commit])
  })
})).then(results => {
  metadata.skeleton = JSON.parse(JSON.stringify(largeObject))

  return Promise.all(results.map(([file, backend, machine, commit]) => {
    return new Promise((resolve, reject) => {
      if (!(commit in commits)) {
        return resolve()
      }

      if (!_.get(settings, ['whitelist', backend]) || !_.get(settings, ['whitelist', backend, machine])) {
        return resolve()
      }

      const data = require(`${benchmarkResultsFolder}/${file}`)

      for (const benchmarkKey in data) {
        const benchmark = data[benchmarkKey]
        if (!('datasets' in benchmark) || Object.keys(benchmark['datasets']).length == 0) {
          delete data[benchmarkKey]
          continue
        }

        _.set(metadata.benchmarks, [benchmarkKey], [])

        for (const datasetKey in benchmark['datasets']) {
          const dataset = benchmark['datasets'][datasetKey]
          const runtimes = dataset['runtimes']
          if (runtimes === undefined) {
            delete benchmark['datasets'][datasetKey]
            continue
          }

          metadata.benchmarks[benchmarkKey].push(datasetKey)

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

  metadata.benchmarks = _.mapValues(metadata.benchmarks, datasets => _.uniq(datasets))

  fs.writeFileSync('./out/metadata.json', JSON.stringify(metadata))
}).then(results => {
  console.log('Done! :)')
})

const average = (data) => data.reduce((sum, value) => sum + value, 0) / data.length

const standardDeviation = (values) => {
  const avg = average(values)
  return Math.sqrt(average(values.map((value) => {
    const diff = value - avg
    return diff * diff
  })))
}
