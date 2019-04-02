module.exports = readObject

const Declaration = require('./lib/declaration')
const Reference = require('./lib/reference')
const readFunction = require('./readFunction')

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
