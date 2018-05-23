const fs = require('fs')
const glob = require('glob')
var _ = require('lodash')

const average = (data) => data.reduce((sum, value) => sum + value, 0) / data.length
const standardDeviation = (values) => {
  const avg = average(values)
  return Math.sqrt(average(values.map((value) => {
    const diff = value - avg
    return diff * diff
  })))
}

const processData = ({files, commitData, benchmarkResultsFolder, settings}) => {
  const largeObject = {}
  const metadata = {
    skeleton: {},
    commits: commitData,
    benchmarks: {}
  }

  const parsedFiles = files.map(file => {
    const [backend, machine, commit] = file.replace('.json', '').split('-').splice(1)
    return [file, backend, machine, commit]
  })

  metadata.skeleton = _.cloneDeep(largeObject)

  for (const [file, backend, machine, commit] of parsedFiles) {
    if (!(commit in commitData)) {
      continue
    }

    if (!_.get(settings, ['whitelist', backend]) || !_.get(settings, ['whitelist', backend, machine])) {
      continue
    }

    const data = JSON.parse(fs.readFileSync(`${benchmarkResultsFolder}/${file}`))

    for (const benchmarkKey in data) {
      const benchmark = data[benchmarkKey]
      if (!('datasets' in benchmark) || Object.keys(benchmark['datasets']).length === 0) {
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

    _.set(largeObject, [backend, machine, commit], data)
    _.set(metadata.skeleton, [backend, machine], {})
  }


  metadata.benchmarks = _.mapValues(metadata.benchmarks, datasets => _.uniq(datasets))

  return {largeObject, metadata}
}

// If this script was executed directly
if (require.main === module) {
  const settings = JSON.parse(fs.readFileSync('./settings.json'))
  const benchmarkResultsFolder = './benchmark-results'
  const files = glob.sync('*.json', {
    cwd: benchmarkResultsFolder
  })

  const commitData = JSON.parse(fs.readFileSync('./out/commits.json'))
  const {largeObject, metadata} = processData({files, commitData, benchmarkResultsFolder, settings})

  fs.writeFileSync('./out/combined.json', JSON.stringify(largeObject))
  fs.writeFileSync('./out/metadata.json', JSON.stringify(metadata))
}

