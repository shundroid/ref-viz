let newId = 0

function bindReference(program, navigation = []) {
  navigation.push(program)
  for (let item of program.items) {
    if (item.referenceName) {
      for (let i = navigation.length - 1; i >= 0; i--) {
        const matchDeclarations = navigation[i].items.filter(_item => {
          if (_item.variableName) {
            return _item.variableName === item.referenceName
          } else if (_item.scopeName) {
            return _item.scopeName === item.referenceName
          }
          return false
        })
        if (matchDeclarations.length > 0) {
          if (matchDeclarations[0].variableName && matchDeclarations[0].declarationId === null) {
            matchDeclarations[0].declarationId = newId
            newId++
          } else if (matchDeclarations[0].scopeName && matchDeclarations[0].scopeId === null) {
            matchDeclarations[0].scopeId = newId
            newId++
          }
          item.referenceId = matchDeclarations[0].variableName ? matchDeclarations[0].declarationId : matchDeclarations[0].scopeId
          break
        }
        // if there's not an accurate declaration, we don't rewrite referenceId.
      }
    } else if (item.scopeName) {
      bindReference(item, navigation.slice(0))
    }
  }
}

module.exports = bindReference
