const assert = require('assert')
const bindReference = require('../src/bindReference')
const Declaration = require('../src/lib/declaration')
const Reference = require('../src/lib/reference')
const Scope = require('../src/lib/scope')

describe('bindReference', () => {
  it('should bind references in a same scope', () => {
    const scope = new Scope('root', [
      new Declaration('a'),
      new Reference('a')
    ])
    bindReference(scope)
    assert.notEqual(scope.items[0].declarationId, null)
    assert.equal(scope.items[0].declarationId, scope.items[1].referenceId)
  })
  it('should bind references in a child scope', () => {
    const scope = new Scope('root', [
      new Scope('b', [
        new Reference('a')
      ]),
      new Declaration('a')
    ])
    bindReference(scope)
    assert.notEqual(scope.items[1].declarationId, null)
    assert.equal(scope.items[0].items[0].referenceId, scope.items[1].declarationId)
  })
  it('should obey the priority of declarations', () => {
    const scope = new Scope('root', [
      new Scope('1', [
        new Scope('2', [
          new Scope('3', [
            new Declaration('a')
          ]),
          new Reference('a')
        ]),
        new Declaration('a')
      ]),
      new Declaration('a')
    ])
    bindReference(scope)
    assert.notEqual(scope.items[0].items[1].declarationId, null)
    assert.equal(scope.items[0].items[0].items[1].referenceId, scope.items[0].items[1].declarationId)
  })
  it('should support object-style reference', () => {
    const scope = new Scope('root', [
      new Reference('a.b.c'),
      new Scope('a', [
        new Scope('b', [
          new Declaration('c')
        ])
      ])
    ])
    bindReference(scope)
    assert.notEqual(scope.items[0].referenceId, null)
    assert.equal(scope.items[0].referenceId, scope.items[1].items[0].items[0].declarationId)
  })
  it('should support object-style reference for scope', () => {
    const scope = new Scope('root', [
      new Reference('a.b'),
      new Scope('a', [
        new Scope('b', [
        ])
      ])
    ])
    bindReference(scope)
    assert.notEqual(scope.items[0].referenceId, null)
    assert.equal(scope.items[0].referenceId, scope.items[1].items[0].scopeId)
  })
})
