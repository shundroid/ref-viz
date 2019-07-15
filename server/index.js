const fs = require('fs')
const path = require('path')

const readFile = require('./src/readFile')
const updateServerData = require('./src/serve')
const Declaration = require('./src/lib/declaration')

const fileAndInfos = []

const entryFile = './src/readFunction.js'

function onReadFile({ file, details }) {
  return new Promise((resolve, reject) => {
    fileAndInfos.push({ file, details })
    if (details.imports) {
      const promises = []
      for (let importFile of details.imports) {
        promises.push(
          readFile(path.join(path.dirname(file.name), importFile + '.js'))
          .then(onReadFile)
        )
      }
      Promise.all(promises).then(() => {
        resolve()
      })
    } else {
      resolve()
    }
  })
}
readFile(entryFile).then(onReadFile).then(() => {
  console.log(fileAndInfos)
  updateServerData(fileAndInfos)
}).catch(error => {
  console.error(error)
})

