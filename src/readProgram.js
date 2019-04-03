const Program = require('./lib/program')
const readFunction = require('./readFunction')

function readProgram(filePath, program) {
  const { declarations, references } = readFunction(['root'], program)
  return new Program(filePath, declarations, references)
}

module.exports = readProgram