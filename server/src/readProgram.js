const Program = require('./lib/program')
const readFunction = require('./readFunction')
const bindReference = require('./bindReference')

function readProgram(filePath, program) {
  const result = readFunction(program)
  console.log(bindReference(result))
  return new Program(filePath, result)
}

module.exports = readProgram
