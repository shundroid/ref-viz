const fs = require('fs')
const path = require('path')

const readFile = require('./src/readFile')
const updateServerData = require('./src/serve')
const Scope = require('./src/lib/declaration')

const fileAndInfos = {}

const entryFile = path.normalize('./src/readFunction.js')

function onReadFile({ file, details }) {
  return new Promise((resolve, reject) => {
    fileAndInfos[file.name] = { file, details }
    if (details.imports) {
      const promises = []
      const importFiles = Object.keys(details.imports)
      for (let importFile of importFiles) {
        const importPath = path.join(path.dirname(file.name), importFile + '.js')
        if (importPath !== importFile) {
          details.imports[importPath] = details.imports[importFile]
          delete details.imports[importFile]
        }
        if (!fileAndInfos[importPath]) {
          promises.push(readFile(importPath).then(onReadFile))
        }
      }
      Promise.all(promises).then(() => {
        fixImportReferences(file, details)
        resolve()
      })
    } else {
      resolve()
    }
  })
}

function fixImportReferences(file, details) {
  const importIds = Object.values(details.imports)
  const importFiles = Object.keys(details.imports)
  for (let item of file.items) {
    if (item.referenceId) {
      const index = importIds.indexOf(item.referenceId)
      if (index !== -1) {
        if (fileAndInfos[importFiles[index]]) {
          const referenceFile = fileAndInfos[importFiles[index]]
          if (referenceFile.details && referenceFile.details.exports) {
            item.referenceId = referenceFile.details.exports.referenceId
          }
        }
      }
    } else if (item.isDeclaration) {
      fixImportReferences(item, details)
    }
  }
}

function toOneScope(fileAndInfos) {
  const scope = new Scope('root')
  const files = Object.values(fileAndInfos)
  for (let file of files) {
    scope.add(file.file)
  }
  return scope
}

readFile(entryFile).then(onReadFile).then(() => {
  updateServerData(toOneScope(fileAndInfos))
}).catch(error => {
  console.error(error)
})

