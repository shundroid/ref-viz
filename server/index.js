const acorn = require('acorn')
const fs = require('fs')

const readProgram = require('./src/readProgram')
const updateServerData = require('./src/serve')

const programs = []

const entryFile = './src/readFunction.js'

fs.readFile(entryFile, (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  const program = readProgram(entryFile, acorn.Parser.parse(data.toString()))
  console.log(JSON.stringify(program))
  updateServerData(program)
})
