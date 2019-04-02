function getMemberExpression(memberExpression) {
  const members = []
  members.push(memberExpression.property.name)
  switch (memberExpression.object.type) {
    case 'MemberExpression':
      members.push(...getMemberExpression(memberExpression.object))
      break
    case 'Identifier':
      members.push(memberExpression.object.name)
  }
  return members
}

function toStringMemberExpression(memberExpression) {
  return getMemberExpression(memberExpression).reverse().join('.')
}

module.exports = toStringMemberExpression
