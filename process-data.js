const fs = require('fs');
const glob = require("glob")
const zlib = require('zlib')

const benchmarkResultsFolder = './benchmark-results'

const files = glob.sync("*.json", {
  cwd: benchmarkResultsFolder
})

const commits = require('./commits.json')

const largeObject = {}

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
  return Promise.all(results.map(([file, backend, machine, commit]) => {
    return new Promise((resolve, reject) => {
      if (!commit in commits)
        return resolve()

      const data = require(`${benchmarkResultsFolder}/${file}`)

      for (const benchmarkKey in data) {
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
          //dataset['avg-'] = Math.round(average(filterOutliers(runtimes)))
          dataset['stdDev'] = Math.round(standardDeviation(runtimes))
          //dataset['stdDev-'] = Math.round(standardDeviation(filterOutliers(runtimes)))
        } 
      }
      
      largeObject[backend][machine][commit] = data
      resolve()
    })
  }))
}).then(results => {
  const json = JSON.stringify(largeObject)
  fs.writeFileSync('./combined.json', json)
  fs.writeFileSync('./combined.json.gz', zlib.gzipSync(json))

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

function filterOutliers(someArray) {
  if(someArray.length < 4)
    return someArray

  let values, q1, q3, iqr, maxValue, minValue

  values = someArray.slice().sort( (a, b) => a - b)//copy array fast and sort

  if((values.length / 4) % 1 === 0){//find quartiles
    q1 = 1/2 * (values[(values.length / 4)] + values[(values.length / 4) + 1])
    q3 = 1/2 * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1])
  } else {
    q1 = values[Math.floor(values.length / 4 + 1)]
    q3 = values[Math.ceil(values.length * (3 / 4) + 1)]
  }

  iqr = q3 - q1
  maxValue = q3 + iqr * 1.5
  minValue = q1 - iqr * 1.5

  return values.filter((x) => (x >= minValue) && (x <= maxValue))
}
