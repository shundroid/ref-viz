module.exports = readFunction

const Declaration = require('./lib/declaration')
const Reference = require('./lib/reference')
const readObject = require('./readObject')
const toStringMemberExpression = require('./toStringMemberExpression')

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
        switch (expression.type) {
          case 'AssignmentExpression':
            references.push(...expressionToReference(expression.left, belongs))
            references.push(...expressionToReference(expression.right, belongs))
            break
          case 'CallExpression':
            if (expression.callee.type === 'Identifier') {
              references.push(new Reference(expression.callee.name, belongs))
            } else if (expression.callee.type === 'MemberExpression') {
              references.push(new Reference(
                toStringMemberExpression(expression.callee),
                belongs
              ))
            }
        }
        break
    }
  }
  return { declarations, references }
}

function expressionToReference(expression, belongs) {
  const references = []
  if (expression.type === 'Identifier') {
    references.push(new Reference(expression.name, belongs))
  } else if (expression.type === 'MemberExpression') {
    references.push(new Reference(
      toStringMemberExpression(expression),
      belongs
    ))
  }
  return references
}
