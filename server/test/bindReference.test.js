const assert = require('assert')
const bindReference = require('../src/bindReference')
const Reference = require('../src/lib/reference')
const Declaration = require('../src/lib/declaration')

describe('bindReference', () => {
  it('should bind references in a same scope', () => {
    const scope = new Declaration('root', [
      new Declaration('a'),
      new Reference('a')
    ])
    bindReference(scope)
    assert.notEqual(scope.items[0].id, null)
    assert.equal(scope.items[0].id, scope.items[1].referenceId)
  })
  it('should bind references in a child scope', () => {
    const scope = new Declaration('root', [
      new Declaration('b', [
        new Reference('a')
      ]),
      new Declaration('a')
    ])
    bindReference(scope)
    assert.notEqual(scope.items[1].id, null)
    assert.equal(scope.items[0].items[0].referenceId, scope.items[1].id)
  })
  it('should obey the priority of declarations', () => {
    const scope = new Declaration('root', [
      new Declaration('1', [
        new Declaration('2', [
          new Declaration('3', [
            new Declaration('a')
          ]),
          new Reference('a')
        ]),
        new Declaration('a')
      ]),
      new Declaration('a')
    ])
    bindReference(scope)
    assert.notEqual(scope.items[0].items[1].id, null)
    assert.equal(scope.items[0].items[0].items[1].referenceId, scope.items[0].items[1].id)
  })
  it('should support object-style reference', () => {
    const scope = new Declaration('root', [
      new Reference('a.b.c'),
      new Declaration('a', [
        new Declaration('b', [
          new Declaration('c')
        ])
      ])
    ])
    bindReference(scope)
    assert.notEqual(scope.items[0].referenceId, null)
    assert.equal(scope.items[0].referenceId, scope.items[1].items[0].items[0].id)
  })
  it('should support object-style reference for scope', () => {
    const scope = new Declaration('root', [
      new Reference('a.b'),
      new Declaration('a', [
        new Declaration('b', [
        ])
      ])
    ])
    bindReference(scope)
    assert.notEqual(scope.items[0].referenceId, null)
    assert.equal(scope.items[0].referenceId, scope.items[1].items[0].id)
  })
})
