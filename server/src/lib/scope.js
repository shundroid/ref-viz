class Scope {
  constructor(scopeName = null, items = []) {
    this.scopeId = null
    this.scopeName = scopeName
    this.items = items
  }
  add(item) {
    this.items.push(item)
  }
  merge(scope) {
    this.items.push(...scope.items)
  }
}

module.exports = Scope
