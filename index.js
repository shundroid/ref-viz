const acorn = require('acorn')
const fs = require('fs')

const Program = require('./lib/program')
const Declaration = require('./lib/declaration')

const programs = []

const entryFile = './test-files/main.js'

fs.readFile(entryFile, (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  const program = readProgram(entryFile, acorn.Parser.parse(data.toString()))
})

function readProgram(filePath, program) {
  const { declarations, references } = readFunction(['root'], program)
  return new Program(filePath, declarations, references)
}

function readFunction(belongs, fn) {
  const declarations = []
  const references = []
  for (let node of fn.body) {
    switch (node.type) {
      case 'VariableDeclaration':
        for (let declarator of node.declarations) {
          if (declarator.type === 'VariableDeclarator') {
            declarations.push(new Declaration(declarator.id.name, belongs))
          }
        }
        break
      case 'FunctionDeclaration':
        declarations.push(new Declaration(node.id.name, belongs))
        const fn = readFunction([
          ...belongs,
          node.id.name
        ], node.body)
        declarations.push(...fn.declarations)
        references.push(...fn.references)
    }
  }
  return { declarations, references }
}

function readObject() {

}
