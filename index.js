const acorn = require('acorn')
const fs = require('fs')

const Program = require('./lib/program')
const Declaration = require('./lib/declaration')
const Reference = require('./lib/reference')

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

function readProgram(filePath, program) {
  console.log(program)
  const { declarations, references } = readFunction(['root'], program)
  return new Program(filePath, declarations, references)
}

function readFunction(belongs, fn) {
  const declarations = []
  const references = []
  console.log(fn)
  for (let node of fn.body) {
    switch (node.type) {
      case 'VariableDeclaration':
        for (let declarator of node.declarations) {
          if (declarator.type === 'VariableDeclarator') {
            declarations.push(new Declaration(declarator.id.name, belongs))
          }
          if (declarator.init) {
            switch (declarator.init.type) {
              case 'ObjectExpression':
                const obj = readObject([
                  ...belongs,
                  declarator.id.name
                ], declarator.init)
                declarations.push(...obj.declarations)
                references.push(...obj.references)
                break
              case 'ArrowFunctionExpression':
              case 'FunctionExpression':
                const fn = readFunction([
                  ...belongs,
                  declarator.id.name
                ], declarator.init.body)
                declarations.push(...fn.declarations)
                references.push(...fn.references)
                break
            }
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
        break
      case 'ExpressionStatement':
        const expression = node.expression
        if (expression.left.type === 'Identifier') {
          references.push(new Reference(expression.left.name, belongs))
        }
        if (expression.right.type === 'Identifier') {
          references.push(new Reference(expression.right.name, belongs))
        }
    }
  }
  return { declarations, references }
}

function readObject(belongs, objectExpression) {
  const declarations = []
  const references = []
  for (let property of objectExpression.properties) {
    declarations.push(new Declaration(property.key.name, belongs))
    switch (property.value.type) {
      case 'FunctionExpression':
        const fn = readFunction([
          ...belongs,
          property.key.name
        ], property.value.body)
        declarations.push(...fn.declarations)
        references.push(...fn.references)
        break
      case 'ObjectExpression':
        const obj = readObject([
          ...belongs,
          property.key.name
        ], property.value)
        declarations.push(...obj.declarations)
        references.push(...obj.references)
        break
    }
  }
  return { declarations, references }
}

function toStringMemberExpression(memberExpression) {
  const members = []
  switch (memberExpression.object.type) {
    case 'MemberExpression':
      toStringMemberExpression(memberExpression.object)
      break
    case 'Identifier':
      members.push(memberExpression.object.name)
  }
}
