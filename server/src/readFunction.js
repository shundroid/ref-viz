module.exports = readFunction

const Reference = require('./lib/reference')
const Declaration = require('./lib/declaration')
const toStringMemberExpression = require('./toStringMemberExpression')
const anonymous = require('./lib/anonymous')

function readFunction(fn, functionName = null) {
  const result = new Declaration(functionName)
  for (let node of fn.body) {
    if (readNodes[node.type]) {
      readNodes[node.type](node, result)
    }
  }
  return result
}

function readObject(objectExpression, objectName = null) {
  const result = new Declaration(objectName)
  for (let property of objectExpression.properties) {
    switch (property.value.type) {
      case 'ObjectExpression':
        readExpressions.ObjectExpression(property.value, result, property.key.name)
        break
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        readExpressions.FunctionExpression(property.value, result, property.key.name)
        break
      default:
        result.add(new Declaration(property.key.name))
        if (readExpressions[property.value.type]) {
          readExpressions[property.value.type](property.value, result)
        }
    }
  }
  return result
}

const readNodes = {
  VariableDeclaration(node, result) {
    for (let declarator of node.declarations) {
      if (declarator.init) {
        switch (declarator.init.type) {
          case 'ObjectExpression':
            readExpressions.ObjectExpression(declarator.init, result, declarator.id.name)
            break
          case 'ArrowFunctionExpression':
          case 'FunctionExpression':
            readExpressions.FunctionExpression(declarator.init, result, declarator.id.name)
            break
          default:
            result.add(new Declaration(declarator.id.name))
            if (readExpressions[declarator.init.type]) {
              readExpressions[declarator.init.type](declarator.init, result)
            }
            break
        }
      } else {
        if (declarator.type === 'VariableDeclarator') {
          result.add(new Declaration(declarator.id.name))
        }
      }
    }
  },
  FunctionDeclaration(node, result) {
    readExpressions.FunctionExpression(node,
        result, node.id.name)
  },
  ExpressionStatement(node, result) {
    if (readExpressions[node.expression.type]) {
      readExpressions[node.expression.type](node.expression, result)
    }
  },
  IfStatement(node, result) {
    if (readExpressions[node.test.type]) {
      readExpressions[node.test.type](node.test, result)
    }
    if (readNodes[node.consequent.type]) {
      readNodes[node.consequent.type](node.consequent, result)
    }
    if (node.alternate && readNodes[node.alternate.type]) {
      readNodes[node.alternate.type](node.alternate, result)
    }
  },
  ForStatement(node, result) {
    if (node.init && readNodes[node.init.type]) {
      readNodes[node.init.type](node.init, result)
    }
    if (node.test && readExpressions[node.test.type]) {
      readExpressions[node.test.type](node.test, result)
    }
    if (node.update && readExpressions[node.update.type]) {
      readExpressions[node.update.type](node.update, result)
    }
    if (readNodes[node.body.type]) {
      readNodes[node.body.type](node.body, result)
    }
  },
  ForOfStatement(node, result) {
    if (readNodes[node.left.type]) {
      readNodes[node.left.type](node.left, result)
    }
    if (readExpressions[node.right.type]) {
      readExpressions[node.right.type](node.right, result)
    }
    if (readNodes[node.body.type]) {
      readNodes[node.body.type](node.body, result)
    }
  },
  ForInStatement(node, result) {
    readNodes.ForOfStatement(node, result)
  },
  WhileStatement(node, result) {
    if (readExpressions[node.test.type]) {
      readExpressions[node.test.type](node.test, result)
    }
    if (readNodes[node.body.type]) {
      readNodes[node.body.type](node.body, result)
    }
  },
  DoWhileStatement(node, result) {
    readNodes.WhileStatement(node, result)
  },
  BlockStatement(node, result) {
    const fn = readFunction(node)
    result.merge(fn)
  },
  ReturnStatement(node, result) {
    if (readExpressions[node.argument.type]) {
      readExpressions[node.argument.type](node.argument, result)
    }
  }
}

const readExpressions = {
  // a, b, ...
  Identifier(expression, result) {
    result.add(new Reference(expression.name))
  },
  // a.b, c.d, ...
  MemberExpression(expression, result) {
    const memberExp = toStringMemberExpression(expression)
    result.add(new Reference(memberExp.members.join('.')))
    for (let reference of memberExp.references) {
      result.add(reference)
    }
  },
  // a = 0, b = c, ...
  AssignmentExpression(expression, result) {
    if (readExpressions[expression.left.type]) {
      readExpressions[expression.left.type](expression.left, result)
    }
    if (readExpressions[expression.right.type]) {
      readExpressions[expression.right.type](expression.right, result)
    }
  },
  // a + b, c === d, ...
  BinaryExpression(expression, result) {
    readExpressions.AssignmentExpression(expression, result)
  },
  // !a
  UnaryExpression(expression, result) {
    if (readExpressions[expression.argument.type]) {
      readExpressions[expression.argument.type](expression.argument, result)
    }
  },
  // a(), a.b(100), ...
  CallExpression(expression, result) {
    if (readExpressions[expression.callee.type]) {
      readExpressions[expression.callee.type](expression.callee, result)
    }
    for (let arg of expression.arguments) {
      if (readExpressions[arg.type]) {
        readExpressions[arg.type](arg, result)
      }
    }
  },
  // { a, b: 'hoge', ... }
  // declarations is only used for VariableDeclaration
  ObjectExpression(expression, result, objectName) {
    const obj = readObject(expression, objectName)
    result.add(obj)
  },
  // function() {}
  FunctionExpression(expression, result, functionName = null) {
    if (functionName === null) {
      functionName = anonymous
    }
    const fn = readFunction(expression.body, functionName)
    for (let element of expression.params) {
      // this is declaration, not reference
      switch (element.type) {
        case 'Identifier':
          fn.add(new Declaration(element.name))
          break
        case 'AssignmentPattern':
          fn.add(new Declaration(element.left.name))
          if (readExpressions[element.right.type]) {
            readExpressions[element.right.type](element.right, fn)
          }
          break
        case 'RestElement':
          fn.add(new Declaration(element.argument.name))
          break
      }
    }
    result.add(fn)
  },
  ArrowFunctionExpression(expression, result, functionName = null) {
    readExpressions.FunctionExpression(expression, result, functionName)
  },
  // [a, b, ...]
  ArrayExpression(expression, result) {
    for (let element of expression.elements) {
      if (readExpressions[element.type]) {
        readExpressions[element.type](element, result)
      }
    }
  },
  // ...a
  SpreadElement(expression, result) {
    result.add(new Reference(expression.argument.name))
  },
  // i++, --j
  UpdateExpression(expression, result) {
    result.add(new Reference(expression.argument.name))
  },
  // new A()
  NewExpression(expression, result) {
    result.add(new Reference(expression.callee.name))
    for (let element of expression.arguments) {
      if (readExpressions[element.type]) {
        readExpressions[element.type](element, result)
      }
    }
  }
}
