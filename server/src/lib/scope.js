class Scope {
  constructor(scopeName, items = []) {
    this.scopeName = scopeName
    this.items = items
  }
  getScope(belongs) {
    let currentScope = this
    for (let scope of belongs) {
      const scopes = currentScope.items.filter(item => {
        return item.scopeName && item.scopeName === scope
      })
      if (scopes.length === 0) {
        const newScope = new Scope(scope)
        currentScope.items.push(newScope)
        currentScope = newScope
      } else {
        currentScope = scopes[0]
      }
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
    // for (let scopeName in scope.scopes) {
    //   this._merge([
    //     ...belongs,
    //     scopeName
    //   ], scope.scopes[scopeName])
    // }
  }
  merge(scope) {
    this._merge([], scope)
  }
  add(item) {
    this.items.push(item)
  }
  mergeScope(scope) {
    this.items.push(...scope.items)
  }
}

module.exports = Scope
