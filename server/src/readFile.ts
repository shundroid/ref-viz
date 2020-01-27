import readFunction from './readFunction'
import bindReference from './bindReference'
import { Parser } from 'acorn'
import fs from 'fs'

function readFile(filePath: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err)
      }
      const details = {}
      const result = readFunction(Parser.parse(data.toString()), filePath, details)
      console.log(result)
      // run this in index.js?
      bindReference(result, [], details)
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

export default readFile
