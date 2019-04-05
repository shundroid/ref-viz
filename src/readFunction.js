module.exports = readFunction

const Declaration = require('./lib/declaration')
const Reference = require('./lib/reference')
const Scope = require('./lib/scope')
const toStringMemberExpression = require('./toStringMemberExpression')
const anonymous = require('./lib/anonymous')

function readFunction(belongs, fn) {
  const result = new Scope()
  for (let node of fn.body) {
    if (readNodes[node.type]) {
      readNodes[node.type](node, belongs, result)
    }
  }
  return result
}

function readObject(belongs, objectExpression) {
  const result = new Scope()
  for (let property of objectExpression.properties) {
    result.addTo(belongs, new Declaration(property.key.name))
    switch (property.value.type) {
      case 'ObjectExpression':
        readExpressions.ObjectExpression(property.value, [
          ...belongs,
          property.key.name
        ], result)
        break
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        readExpressions.FunctionExpression(property.value, belongs,
          result, property.key.name)
        break
      default:
        if (readExpressions[property.value.type]) {
          readExpressions[property.value.type](property.value, belongs, result)
        }
    }
  }
  return result
}

const readNodes = {
  VariableDeclaration(node, belongs, result) {
    for (let declarator of node.declarations) {
      if (declarator.type === 'VariableDeclarator') {
        result.addTo(belongs, new Declaration(declarator.id.name))
      }
      if (declarator.init) {
        switch (declarator.init.type) {
          case 'ObjectExpression':
            readExpressions.ObjectExpression(declarator.init, [
              ...belongs,
              declarator.id.name
            ], result)
            break
          case 'ArrowFunctionExpression':
          case 'FunctionExpression':
            readExpressions.FunctionExpression(declarator.init, belongs,
              result, declarator.id.name)
            break
          default:
            if (readExpressions[declarator.init.type]) {
              readExpressions[declarator.init.type](declarator.init, belongs, result)
            }
            break
        }
      }
    }
  },
  FunctionDeclaration(node, belongs, result) {
    readExpressions.FunctionExpression(node, belongs,
        result, node.id.name)
    result.addTo(belongs, new Declaration(node.id.name))
  },
  ExpressionStatement(node, belongs, result) {
    if (readExpressions[node.expression.type]) {
      readExpressions[node.expression.type](node.expression, belongs, result)
    }
  },
  IfStatement(node, belongs, result) {
    if (readExpressions[node.test.type]) {
      readExpressions[node.test.type](node.test, belongs, result)
    }
    const fn = readFunction(belongs, node.consequent)
    result.merge(fn)
  },
  ForStatement(node, belongs, result) {
    if (node.init && readNodes[node.init.type]) {
      readNodes[node.init.type](node.init, belongs, result)
    }
    if (node.test && readExpressions[node.test.type]) {
      readExpressions[node.test.type](node.test, belongs, result)
    }
    if (node.update && readExpressions[node.update.type]) {
      readExpressions[node.update.type](node.update, belongs, result)
    }
    const fn = readFunction(belongs, node.body)
    result.merge(fn)
  },
  ForOfStatement(node, belongs, result) {
    if (readNodes[node.left.type]) {
      readNodes[node.left.type](node.left, belongs, result)
    }
    if (readExpressions[node.right.type]) {
      readExpressions[node.right.type](node.right, belongs, result)
    }
    const fn = readFunction(belongs, node.body)
    result.merge(fn)
  },
  ForInStatement(node, belongs, result) {
    readNodes.ForOfStatement(node, belongs, result)
  },
  WhileStatement(node, belongs, result) {
    if (readExpressions[node.test.type]) {
      readExpressions[node.test.type](node.test, belongs, result)
    }
    const fn = readFunction(belongs, node.body)
    result.merge(fn)
  },
  DoWhileStatement(node, belongs, result) {
    readNodes.WhileStatement(node, belongs, result)
  }
}

const readExpressions = {
  // a, b, ...
  Identifier(expression, belongs, result) {
    result.addTo(belongs, new Reference(expression.name))
  },
  // a.b, c.d, ...
  MemberExpression(expression, belongs, result) {
    const memberExp = toStringMemberExpression(expression)
    result.addTo(belongs, new Reference(memberExp.members.join('.')))
    for (let reference of memberExp.references) {
      result.addTo(belongs, reference)
    }
  },
  // a = 0, b = c, ...
  AssignmentExpression(expression, belongs, result) {
    if (readExpressions[expression.left.type]) {
      readExpressions[expression.left.type](expression.left, belongs, result)
    }
    if (readExpressions[expression.right.type]) {
      readExpressions[expression.right.type](expression.right, belongs, result)
    }
  },
  // a + b, c === d, ...
  BinaryExpression(expression, belongs, result) {
    readExpressions.AssignmentExpression(expression, belongs, result)
  },
  // !a
  UnaryExpression(expression, belongs, result) {
    if (readExpressions[expression.argument.type]) {
      readExpressions[expression.argument.type](expression.argument, belongs, result)
    }
  },
  // a(), a.b(100), ...
  CallExpression(expression, belongs, result) {
    if (readExpressions[expression.callee.type]) {
      readExpressions[expression.callee.type](expression.callee, belongs, result)
    }
    for (arg of expression.arguments) {
      if (readExpressions[arg.type]) {
        readExpressions[arg.type](arg, belongs, result)
      }
    }
  },
  // { a, b: 'hoge', ... }
  // declarations is only used for VariableDeclaration
  ObjectExpression(expression, belongs, result) {
    const obj = readObject(belongs, expression)
    result.merge(obj)
  },
  // function() {}
  FunctionExpression(expression, belongs, result, functionName = null) {
    if (functionName === null) {
      functionName = anonymous
    }
    // On used functionExpression, we should change belongs,
    // but whether declaring functionName or not is optional.
    const fn = readFunction([
      ...belongs,
      functionName
    ], expression.body)
    result.merge(fn)
  },
  ArrowFunctionExpression(expression, belongs, result) {
    readExpressions.FunctionExpression(expression, belongs, result)
  },
  // [a, b, ...]
  ArrayExpression(expression, belongs, result) {
    for (let element of expression.elements) {
      if (readExpressions[element.type]) {
        readExpressions[element.type](element, belongs, result)
      }
    }
  },
  // ...a
  SpreadElement(expression, belongs, result) {
    result.addTo(belongs, new Reference(expression.argument.name))
  },
  // i++, --j
  UpdateExpression(expression, belongs, result) {
    result.addTo(belongs, new Reference(expression.argument.name))
  }
}
