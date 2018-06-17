const fs = require('fs')
const pako = require('pako')

const saveFileAndCompress = (fileName, data) => {
  fs.writeFileSync(fileName, data)
  fs.writeFileSync(`${fileName}.gz`, pako.deflate(data, {
    level: 9,
    strategy: 1,
  }))
}

module.exports = {saveFileAndCompress}