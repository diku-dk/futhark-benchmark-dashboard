const fs = require('fs')
const rimraf = require('rimraf')
const baseDir = 'out/data-split'

if (process.argv[2] == null) {
  console.log('Please run: split-data.js <input file>')
  process.exit()
}

const inputData = JSON.parse(fs.readFileSync(process.argv[2]))

rimraf.sync(baseDir)
fs.mkdirSync(baseDir)

for (const backendIndex in inputData) {
  const backend = inputData[backendIndex]
  fs.mkdirSync(`${baseDir}/${backendIndex}`)

  for (const machineIndex in backend) {
    const machine = backend[machineIndex]
    const json = JSON.stringify(machine)

    fs.writeFileSync(`${baseDir}/${backendIndex}/${machineIndex}.json`, json)
  }
}
