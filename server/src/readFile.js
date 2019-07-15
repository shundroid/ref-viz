const Program = require('./lib/program')
const readFunction = require('./readFunction')
const bindReference = require('./bindReference')
const acorn = require('acorn')
const fs = require('fs')

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      console.log(filePath)
      console.log(data.toString())
      if (err) {
        reject(err)
      }
      const details = {}
      const result = readFunction(acorn.Parser.parse(data.toString()), filePath, details)
      // run this in index.js?
      // bindReference(result)
      // console.log(JSON.stringify(result))
      // const promises = []
      // if (details.imports) {
      //   for (let file of details.imports) {
      //     promises.push(readFile(path.join(path.dirname(filePath), file + '.js')))
      //   }
      //   Promise.all(promises).then(_result => {
      //     resolve([
      //       ..._result,
      //       { file: result, details }
      //     ])
      //   }, err => {
      //     reject(err)
      //   })
      //   return
      // }
      resolve({ file: result, details })
    })
  })
}

module.exports = readFile
