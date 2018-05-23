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
  const combined = {}
  const metadata = {
    skeleton: {},
    commits: commitData,
    benchmarks: {}
  }

  for (const file of files) {
    const [backend, machine, commit] = file.replace('.json', '').split('-').splice(1)

    if (!(commit in commitData)) {
      continue
    }

    if (_.get(settings, ['whitelist', backend, machine]) == null) {
      continue
    }

    const data = JSON.parse(fs.readFileSync(`${benchmarkResultsFolder}/${file}`))

    for (const benchmarkKey in data) {
      const benchmark = data[benchmarkKey]
      const {datasets} = benchmark
      
      if (datasets == null || Object.keys(datasets).length === 0) {
        continue
      }

      for (const datasetKey in datasets) {
        const dataset = datasets[datasetKey]
        const {runtimes} = dataset

        if (runtimes == null) {
          continue
        }

        _.get(metadata.benchmarks, [benchmarkKey], []).push(datasetKey)

        _.set(combined, [backend, machine, commit, benchmarkKey, 'datasets', datasetKey], {
          avg: Math.round(average(runtimes)),
          stdDev: Math.round(standardDeviation(runtimes))
        })
      }
    }

    _.set(metadata.skeleton, [backend, machine], {})
  }

  metadata.benchmarks = _.mapValues(metadata.benchmarks, datasets => _.uniq(datasets))

  return {combined, metadata}
}

// If this script was executed directly
if (require.main === module) {
  const settings = JSON.parse(fs.readFileSync('./settings.json'))
  const benchmarkResultsFolder = './benchmark-results'
  const files = glob.sync('*.json', {
    cwd: benchmarkResultsFolder
  })

  const commitData = JSON.parse(fs.readFileSync('./out/commits.json'))
  const {combined, metadata} = processData({files, commitData, benchmarkResultsFolder, settings})

  fs.writeFileSync('./out/combined.json', JSON.stringify(combined))
  fs.writeFileSync('./out/metadata.json', JSON.stringify(metadata))
}
