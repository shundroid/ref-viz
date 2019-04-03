// Can use both for declarations and for references
module.exports = (declarations) => {
  declarations.forEach(declaration => {
    declaration.belongs = declaration.belongs.map(scope => {
      if (typeof scope === 'symbol') {
        return scope.toString()
      }
      return scope
    })
  })
}
