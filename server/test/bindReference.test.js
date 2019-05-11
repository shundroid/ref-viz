/*const assert = require('assert')
const bindReference = require('../src/lib/bindReference')
const Declaration = require('../src/lib/declaration')
const Reference = require('../src/lib/reference')

describe('bindReference', () => {
  it('should bind references in a same scope', () => {
    const file = {
      filePath: 'test.js',
      scope: {
        items: [
          new Declaration('a'),
          new Reference('a')
        ]
      }
    }
    const bindedFile = bindReference(file)
    assert.equal(bindedFile.scope.items[0].declarationId, bindedFile.scope.items[1].referenceId)
  })
  it('should bind references in a child scope', () => {
    const file = {
      filePath: 'test.js',
      scope: {
        scope: {
          b: {
            scope: {},
            items: [
              new Declaration('b'),
              new Declaration('a')
            ]
          }
        },
        items: [
          new Declaration('a'),
          new Reference('b')
        ]
      }
    }
    const bindedFile = bindReference(file)
    assert.equal(bindedFile.scope.items[0].)
  })
  it('should work', () => {
    const file = {
      filePath: 'test.js',
      scope: {
        scopes: {
          b: {
            scopes: {
              c: {
                scopes: {},
                items: [
                  new Declaration('d'),
                  new Declaration('e'),
                  new Reference('a')
                ]
              }
            },
            items: [
              new Reference('a'),
              new Declaration('a')
            ]
          }
        },
        items: [
          new Declaration('a'),
          new Reference('b.c'),
          new Reference('b.c.d')
        ]
      }
    }
    assert.deepEqual(bindReference(file), {
      filePath: 'test.js',
      scope: {
        scopes: {
          b: {
            scopes: {
              c: {
                scopes: {},
                items: [
                  new Declaration('d')
                ]
              }
            },
            items: [
              new Reference('a')
            ]
          }
        },
        items: [
          new Declaration('a'),
          new Reference('b.c')
        ]
      }
    })
  })
})
*/