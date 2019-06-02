const Program = require('./lib/program')
const readFunction = require('./readFunction')
const bindReference = require('./bindReference')

function readProgram(filePath, program) {
  const result = readFunction(program)
  bindReference(result)
  console.log(result)
  return new Program(filePath, result)
}

module.exports = readProgram
