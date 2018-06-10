const fs = require('fs')

const splitData = (inputData, baseDir, filenameExtra) => {
  for (const backendIndex in inputData) {
    const backend = inputData[backendIndex]
    if (!fs.existsSync(`${baseDir}/${backendIndex}`)) {
      fs.mkdirSync(`${baseDir}/${backendIndex}`)
    }

    for (const machineIndex in backend) {
      const machine = backend[machineIndex]
      const json = JSON.stringify(machine)

      fs.writeFileSync(`${baseDir}/${backendIndex}/${machineIndex}${filenameExtra}.json`, json)
    }
  }
}

module.exports = {splitData}
