let newId = 0

function bindReference(program, navigation = []) {
  navigation.push(program)
  for (let item of program.items) {
    if (item.referenceName) {
      const reference = item.referenceName.split('.')
      for (let i = navigation.length - 1; i >= 0; i--) {
        const matchDeclarations = navigation[i].items.filter(_item => {
          if (_item.variableName) {
            return _item.variableName === reference[0]
          } else if (_item.scopeName) {
            return _item.scopeName === reference[0]
          }
          return false
        })
        if (matchDeclarations.length > 0) {
          let currentScope = matchDeclarations[0]
          if (currentScope.variableName && currentScope.declarationId === null) {
            currentScope.declarationId = newId
            newId++
          } else if (currentScope.scopeName) {
            if (reference.length > 1) {
              for (let j = 1; j < reference.length; j++) {
                if (currentScope.variableName) break
                const variables = currentScope.items.filter(item => item.variableName === reference[j])
                if (variables.length > 0) {
                  currentScope = variables[0]
                  break
                }
                const scopes = currentScope.items.filter(item => item.scopeName === reference[j])
                if (scopes.length > 0) {
                  currentScope = scopes[0]
                }
              }
            }
            if (currentScope.variableName && currentScope.declarationId === null) {
              currentScope.declarationId = newId
              newId++
            } else if (currentScope.scopeName && currentScope.scopeId === null) {
              currentScope.scopeId = newId
              newId++
            }
          }
          item.referenceId = currentScope.variableName ? currentScope.declarationId : currentScope.scopeId
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
