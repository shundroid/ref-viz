const Reference = require('./lib/reference')

function getMemberExpression(expression) {
  const members = []
  const references = []
  if (expression.property.type === 'Identifier') {
    if (expression.computed) {
      references.push(new Reference(expression.property.name))
    } else {
      members.push(expression.property.name)
    }
  }
  switch (expression.object.type) {
    case 'MemberExpression':
      const obj = getMemberExpression(expression.object)
      members.push(...obj.members)
      references.push(...obj.references)
      break
    case 'Identifier':
      members.push(expression.object.name)
      break
  }
  return { members, references }
}

function toStringMemberExpression(memberExpression) {
  const result = getMemberExpression(memberExpression)
  result.members = result.members.reverse()
  result.references = result.references.reverse()
  return result
}

module.exports = toStringMemberExpression
