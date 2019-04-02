const acorn = require('acorn')
const fs = require('fs')

const readProgram = require('./src/readProgram')

const programs = []

const entryFile = './test-files/main.js'

fs.readFile(entryFile, (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  const program = readProgram(entryFile, acorn.Parser.parse(data.toString()))
  console.log(program)
  console.log(program.declarations.forEach(declaration => console.log(declaration.belongs)))
})

