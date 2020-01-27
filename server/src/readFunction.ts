export default readFunction

import Reference from './lib/reference'
import Declaration from './lib/declaration'
import toStringMemberExpression from './toStringMemberExpression'
import anonymous from './lib/anonymous'

let details: any = {}

function readFunction(fn: any, functionName = null, _details: any = null) {
  if (_details !== null) {
    details = _details
  }
  const scope = new Declaration(functionName)
  for (let node of fn.body) {
    if (readNodes[node.type]) {
      readNodes[node.type](node, scope)
    }
  }
  return scope
}

function readObject(objectExpression, objectName = null) {
  const scope = new Declaration(objectName)
  for (let property of objectExpression.properties) {
    switch (property.value.type) {
      case 'ObjectExpression':
        readExpressions.ObjectExpression(property.value, scope, property.key.name)
        break
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        readExpressions.FunctionExpression(property.value, scope, property.key.name)
        break
      default:
        scope.add(new Declaration(property.key.name))
        if (readExpressions[property.value.type]) {
          readExpressions[property.value.type](property.value, scope)
        }
    }
  }
  return scope
}

const readNodes = {
  VariableDeclaration(node, scope) {
    for (let declarator of node.declarations) {
      if (declarator.init) {
        switch (declarator.init.type) {
          case 'ObjectExpression':
            readExpressions.ObjectExpression(declarator.init, scope, declarator.id.name)
            break
          case 'ArrowFunctionExpression':
          case 'FunctionExpression':
            readExpressions.FunctionExpression(declarator.init, scope, declarator.id.name)
            break
          default:
            if (declarator.init.type === 'CallExpression' && declarator.init.callee.name === 'require') {
              const declaration = new Declaration(declarator.id.name)
              declaration.options = {
                type: 'import',
                file: declarator.init.arguments[0].value
              }
              scope.add(declaration)
              if (!details.imports) details.imports = {}
              details.imports[declarator.init.arguments[0].value] = null
              break
            }
            scope.add(new Declaration(declarator.id.name))
            if (readExpressions[declarator.init.type]) {
              readExpressions[declarator.init.type](declarator.init, scope)
            }
            break
        }
      } else {
        if (declarator.type === 'VariableDeclarator') {
          scope.add(new Declaration(declarator.id.name))
        }
      }
    }
  },
  FunctionDeclaration(node, scope) {
    readExpressions.FunctionExpression(node,
        scope, node.id.name)
  },
  ClassDeclaration(node, scope) {
    scope.add(new Declaration(node.id.name))
    readExpressions.ClassExpression(node, scope)
  },
  ExpressionStatement(node, scope) {
    if (readExpressions[node.expression.type]) {
      readExpressions[node.expression.type](node.expression, scope)
    }
  },
  IfStatement(node, scope) {
    if (readExpressions[node.test.type]) {
      readExpressions[node.test.type](node.test, scope)
    }
    if (readNodes[node.consequent.type]) {
      readNodes[node.consequent.type](node.consequent, scope)
    }
    if (node.alternate && readNodes[node.alternate.type]) {
      readNodes[node.alternate.type](node.alternate, scope)
    }
  },
  SwitchStatement(node, scope) {
    if (readExpressions[node.discriminant.type]) {
      readExpressions[node.discriminant.type](node.discriminant, scope)
    }
    for (let switchCase of node.cases) {
      if (readNodes[switchCase.consequent.type]) {
        readNodes[switchCase.consequent.type](switchCase.consequent, scope)
      }
      if (switchCase.test !== null && readExpressions[switchCase.test.type]) {
        readExpressions[switchCase.test.type](switchCase.test, scope)
      }
    }
  },
  ForStatement(node, scope) {
    if (node.init && readNodes[node.init.type]) {
      readNodes[node.init.type](node.init, scope)
    }
    if (node.test && readExpressions[node.test.type]) {
      readExpressions[node.test.type](node.test, scope)
    }
    if (node.update && readExpressions[node.update.type]) {
      readExpressions[node.update.type](node.update, scope)
    }
    if (readNodes[node.body.type]) {
      readNodes[node.body.type](node.body, scope)
    }
  },
  ForOfStatement(node, scope) {
    if (readNodes[node.left.type]) {
      readNodes[node.left.type](node.left, scope)
    }
    if (readExpressions[node.right.type]) {
      readExpressions[node.right.type](node.right, scope)
    }
    if (readNodes[node.body.type]) {
      readNodes[node.body.type](node.body, scope)
    }
  },
  ForInStatement(node, scope) {
    readNodes.ForOfStatement(node, scope)
  },
  WhileStatement(node, scope) {
    if (readExpressions[node.test.type]) {
      readExpressions[node.test.type](node.test, scope)
    }
    if (readNodes[node.body.type]) {
      readNodes[node.body.type](node.body, scope)
    }
  },
  DoWhileStatement(node, scope) {
    readNodes.WhileStatement(node, scope)
  },
  BlockStatement(node, scope) {
    const fn = readFunction(node)
    scope.merge(fn)
  },
  ReturnStatement(node, scope) {
    if (node.argument && readExpressions[node.argument.type]) {
      readExpressions[node.argument.type](node.argument, scope)
    }
  }
}

const readExpressions = {
  // a, b, ...
  Identifier(expression, scope) {
    scope.add(new Reference(expression.name))
  },
  // a.b, c.d, ...
  MemberExpression(expression, scope) {
    const memberExp = toStringMemberExpression(expression)
    scope.add(new Reference(memberExp.members.join('.')))
    for (let reference of memberExp.references) {
      scope.add(reference)
    }
  },
  // a = 0, b = c, ...
  AssignmentExpression(expression, scope) {
    if (expression.left.type === 'Identifier' && expression.left.name === 'exports') {
      if (expression.right.type === 'Identifier') {
        details.exports = new Reference(expression.right.name)
      } else {
        // if else, make anonymous declaration and reference for it.
      }
      return
    }
    if (expression.left.type === 'MemberExpression' &&
        expression.left.object.type === 'Identifier' && expression.left.property.type === 'Identifier' &&
        expression.left.object.name === 'module' && expression.left.property.name === 'exports') {
      if (expression.right.type === 'Identifier') {
        details.exports = new Reference(expression.right.name)
      }
      // if else, make anonymous declaration and reference to it.
      return
    }
    if (readExpressions[expression.left.type]) {
      readExpressions[expression.left.type](expression.left, scope)
    }
    if (readExpressions[expression.right.type]) {
      readExpressions[expression.right.type](expression.right, scope)
    }
  },
  // a + b, c === d, ...
  BinaryExpression(expression, scope) {
    readExpressions.AssignmentExpression(expression, scope)
  },
  // !a
  UnaryExpression(expression, scope) {
    if (readExpressions[expression.argument.type]) {
      readExpressions[expression.argument.type](expression.argument, scope)
    }
  },
  // a(), a.b(100), ...
  CallExpression(expression, scope) {
    if (readExpressions[expression.callee.type]) {
      readExpressions[expression.callee.type](expression.callee, scope)
    }
    for (let arg of expression.arguments) {
      if (readExpressions[arg.type]) {
        readExpressions[arg.type](arg, scope)
      }
    }
  },
  // { a, b: 'hoge', ... }
  // declarations is only used for VariableDeclaration
  ObjectExpression(expression, scope, objectName) {
    const obj = readObject(expression, objectName)
    scope.add(obj)
  },
  // function() {}
  FunctionExpression(expression, scope, functionName = null) {
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
    scope.add(fn)
  },
  ArrowFunctionExpression(expression, scope, functionName = null) {
    readExpressions.FunctionExpression(expression, scope, functionName)
  },
  ClassExpression(expression, scope) {
    if (expression.superClass) {
      scope.add(new Reference(expression.superClass.name))
    }
  },
  // [a, b, ...]
  ArrayExpression(expression, scope) {
    for (let element of expression.elements) {
      if (readExpressions[element.type]) {
        readExpressions[element.type](element, scope)
      }
    }
  },
  // ...a
  SpreadElement(expression, scope) {
    scope.add(new Reference(expression.argument.name))
  },
  // i++, --j
  UpdateExpression(expression, scope) {
    scope.add(new Reference(expression.argument.name))
  },
  // new A()
  NewExpression(expression, scope) {
    scope.add(new Reference(expression.callee.name))
    for (let element of expression.arguments) {
      if (readExpressions[element.type]) {
        readExpressions[element.type](element, scope)
      }
    }
  }
}
