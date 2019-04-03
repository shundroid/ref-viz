module.exports = readFunction

const Declaration = require('./lib/declaration')
const Reference = require('./lib/reference')
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
                readExpressions.ObjectExpression(declarator.init, [
                  ...belongs,
                  declarator.id.name
                ], references, declarations)
                break
              case 'ArrowFunctionExpression':
              case 'FunctionExpression':
                readExpressions.FunctionExpression(declarator.init, belongs,
                  references, declarations, declarator.id.name)
                break
              default:
                if (readExpressions[declarator.init.type]) {
                  readExpressions[declarator.init.type](declarator.init, belongs, references, declarations)
                }
                break
            }
          }
        }
        break
      case 'FunctionDeclaration':
        readExpressions.FunctionExpression(node, belongs,
            references, declarations, node.id.name)
        declarations.push(new Declaration(node.id.name, belongs))
        break
      case 'ExpressionStatement':
        if (readExpressions[node.expression.type]) {
          readExpressions[node.expression.type](node.expression, belongs, references, declarations)
        }
        break
      case 'IfStatement':
        if (readExpressions[node.test.type]) {
          readExpressions[node.test.type](node.test, belongs, references)
        }
        const fn2 = readFunction(belongs, node.consequent)
        declarations.push(...fn2.declarations)
        references.push(...fn2.references)
        break
      case 'ForStatement':
        break
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
      case 'ObjectExpression':
        readExpressions.ObjectExpression(property.value, [
          ...belongs,
          property.key.name
        ], references, declarations)
        break
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        readExpressions.FunctionExpression(property.value, belongs,
          references, declarations, property.key.name)
        break
      default:
        if (readExpressions[property.value.type]) {
          readExpressions[property.value.type](property.value, belongs, references, declarations)
        }
    }
  }
  return { declarations, references }
}

const readExpressions = {
  // a, b, ...
  Identifier(expression, belongs, r, d) {
    r.push(new Reference(expression.name, belongs))
  },
  // a.b, c.d, ...
  MemberExpression(expression, belongs, r, d) {
    r.push(new Reference(
      toStringMemberExpression(expression),
      belongs
    ))
  },
  // a = 0, b = c, ...
  AssignmentExpression(expression, belongs, r, d) {
    if (readExpressions[expression.left.type]) {
      readExpressions[expression.left.type](expression.left, belongs, r, d)
    }
    if (readExpressions[expression.right.type]) {
      readExpressions[expression.right.type](expression.right, belongs, r, d)
    }
  },
  // a + b, c === d, ...
  BinaryExpression(expression, belongs, r, d) {
    readExpressions.AssignmentExpression(expression, belongs, r, d)
  },
  // !a
  UnaryExpression(expression, belongs, r, d) {
    if (readExpressions[expression.argument.type]) {
      readExpressions[expression.argument.type](expression.argument, belongs, r, d)
    }
  },
  // a(), a.b(100), ...
  CallExpression(expression, belongs, r, d) {
    if (readExpressions[expression.callee.type]) {
      readExpressions[expression.callee.type](expression.callee, belongs, r, d)
    }
    for (arg of expression.arguments) {
      if (readExpressions[arg.type]) {
        readExpressions[arg.type](arg, belongs, r, d)
      }
    }
  },
  // { a, b: 'hoge', ... }
  // declarations is only used for VariableDeclaration
  ObjectExpression(expression, belongs, r, d) {
    const obj = readObject(belongs, expression)
    d.push(...obj.declarations)
    r.push(...obj.references)
  },
  // function() {}
  FunctionExpression(expression, belongs, r, d, functionName = null) {
    if (functionName === null) {
      functionName = Symbol('anonymous')
    }
    // On used functionExpression, we should change belongs,
    // but whether declaring functionName or not is optional.
    const fn = readFunction([
      ...belongs,
      functionName
    ], expression.body)
    d.push(...fn.declarations)
    r.push(...fn.references)
  },
  ArrowFunctionExpression(expression, belongs, r, d) {
    readExpressions.FunctionExpression(expression, belongs, r, d)
  },
  // [a, b, ...]
  ArrayExpression(expression, belongs, r, d) {
    for (let element of expression.elements) {
      if (readExpressions[element.type]) {
        readExpressions[element.type](element, belongs, r, d)
      }
    }
  },
  // ...a
  SpreadElement(expression, belongs, r, d) {
    r.push(new Reference(expression.argument.name, belongs))
  }
}
