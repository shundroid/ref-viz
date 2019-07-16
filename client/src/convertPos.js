function getParents(scope) {
  let currentScope = scope
  const parents = []
  do {
    parents.push(currentScope)
    currentScope = currentScope.$parent
  } while (currentScope.$options.name === 'Scope')
  return parents
}
export function toGlobalPos(scope, localPos) {
  let pos = { x: localPos.x, y: localPos.y }
  const parents = getParents(scope)
  for (let scope of parents) {
    pos.x = scope.x + scope.size * pos.x
    pos.y = scope.y + scope.size * pos.y
  }
  return pos
}
export function toLocalPos(scope, globalPos) {
  let pos = { x: globalPos.x, y: globalPos.y }
  const parents = getParents(scope).reverse()
  for (let scope of parents) {
    pos.x = (pos.x - scope.x) / scope.size
    pos.y = (pos.y - scope.y) / scope.size
  }
  return pos
}
