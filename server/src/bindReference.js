let newId = 0

function bindReference(program, navigation = []) {
  navigation.push(program)
  for (let item of program.items) {
    if (item.referenceName) {
      const reference = item.referenceName.split('.')
      for (let i = navigation.length - 1; i >= 0; i--) {
        const matchDeclarations = navigation[i].items.filter(_item => {
          return _item.isDeclaration && _item.name === reference[0]
        })
        if (matchDeclarations.length > 0) {
          let currentDec = matchDeclarations[0]
          if (reference.length > 1) {
            for (let j = 1; j < reference.length; j++) {
              const decs = currentDec.items.filter(item => item.isDeclaration && item.name === reference[j])
              if (decs.length > 0) {
                currentDec = decs[0]
              }
            }
          }
          if (currentDec.id === null) {
            currentDec.id = newId
            newId++
          }
          item.referenceId = currentDec.id
          break
        }
        // if there's not an accurate declaration, we don't rewrite referenceId.
      }
    } else if (item.name) {
      bindReference(item, navigation.slice(0))
    }
  }
}

module.exports = bindReference
