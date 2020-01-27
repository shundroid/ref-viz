import Scope from './lib/declaration';
import Reference from './lib/reference';
let newId = 0

function bindReference(program: Scope, navigation: Scope[] = [], details = null) {
  navigation.push(program)
  for (let item of program.items) {
    if (item instanceof Reference) {
      const dec = searchReference(item.referenceName, navigation)
      if (dec === null) {
        continue
      }
      if (dec.id === null) {
        dec.id = newId++
      }
      if (details && dec.options.type === 'import') {
        details.imports[dec.options.file] = dec.id
      }
      item.referenceId = dec.id
    } else {
      bindReference(item, navigation.slice(0), details)
    }
  }
}

function searchReference(referenceName: string, navigation: Scope[]): Scope | null {
  const reference = referenceName.split('.')
  for (let i = navigation.length - 1; i >= 0; i--) {
    const matchDeclarations = navigation[i].items.filter(_item => {
      return _item instanceof Scope && _item.isDeclaration && _item.name === reference[0]
    }) as Scope[]
    if (matchDeclarations.length > 0) {
      let currentDec = matchDeclarations[0]
      if (reference.length > 1) {
        for (let j = 1; j < reference.length; j++) {
          const decs =
            currentDec.items.filter(item => item instanceof Scope && item.isDeclaration &&
              item.name === reference[j]) as Scope[]
          if (decs.length > 0) {
            currentDec = decs[0]
          }
        }
      }
      return currentDec
    }
    // if there's not an accurate declaration, we don't rewrite referenceId.
  }
  console.log('reachable')
  return null
}

export default function(program: Scope, navigation: Scope[], details = null) {
  // make fileId
  program.id = newId++
  bindReference(program, navigation, details)
  if (details && details.exports) {
    // export reference
    const dec = searchReference(details.exports.referenceName, navigation)
    if (dec.id === null) {
      dec.id = newId++
    }
    if (dec.options.type === 'import') {
      details.imports[dec.name] = dec.id
    }
    details.exports.referenceId = dec.id
  }
}
