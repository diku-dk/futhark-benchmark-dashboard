const fs = require('fs')
const rimraf = require('rimraf')
const zlib = require('zlib')
const baseDir = 'data-split'

if (process.argv[2] == null) {
  console.log("Please run: split-data.js <input file>")
  process.exit()
}

const inputData = JSON.parse(fs.readFileSync(process.argv[2]))

rimraf.sync(baseDir)
fs.mkdirSync(baseDir)

for (backendIndex in inputData) {
	const backend = inputData[backendIndex]
	fs.mkdirSync(`${baseDir}/${backendIndex}`)

	for (machineIndex in backend) {
		const machine = backend[machineIndex]
		const json = JSON.stringify(machine)

		fs.writeFileSync(`${baseDir}/${backendIndex}/${machineIndex}.json`, json)
		fs.writeFileSync(`${baseDir}/${backendIndex}/${machineIndex}.json.gz`, zlib.gzipSync(json))
	}
}
