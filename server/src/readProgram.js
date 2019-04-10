const Program = require('./lib/program')
const readFunction = require('./readFunction')

function readProgram(filePath, program) {
  const result = readFunction([], program)
  return new Program(filePath, result)
}

module.exports = readProgram
