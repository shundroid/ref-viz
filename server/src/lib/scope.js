class Scope {
  constructor() {
    this.scopes = {}
    this.items = []
  }
  getScope(belongs) {
    let currentScope = this
    for (let scope of belongs) {
      if (!currentScope.scopes[scope]) {
        currentScope.scopes[scope] = new Scope()
      }
      currentScope = currentScope.scopes[scope]
    }
    return currentScope
  }
  addTo(belongs, item) {
    this.getScope(belongs).items.push(item)
  }
  _merge(belongs, scope) {
    for (let item of scope.items) {
      this.addTo(belongs, item)
    }
    for (let scopeName in scope.scopes) {
      this._merge([
        ...belongs,
        scopeName
      ], scope.scopes[scopeName])
    }
  }
  merge(scope) {
    this._merge([], scope)
  }
}

module.exports = Scope
