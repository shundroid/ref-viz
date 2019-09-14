class Scope {
  constructor(name = null, items = []) {
    this.id = null
    this.name = name
    this.items = items
    this.isDeclaration = true
    this.options = {}
  }
  add(item) {
    this.items.push(item)
  }
  merge(scope) {
    this.items.push(...scope.items)
  }
}

module.exports = Scope
