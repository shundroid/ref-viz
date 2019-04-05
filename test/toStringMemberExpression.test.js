const assert = require('assert')
const acorn = require('acorn')

const toStringMemberExpression = require('../src/toStringMemberExpression')
const Reference = require('../src/lib/reference')

describe('toStringMemberExpression', () => {
  it('should convert nested object to string', () => {
    const code = acorn.Parser.parse(`
    a.b.c[0].d[hoge]['0'][fuga].e = "success"
    `)
    assert.deepEqual(toStringMemberExpression(code.body[0].expression.left), {
      members: ['a', 'b', 'c', 'd', 'e'],
      references: [
        new Reference('hoge'),
        new Reference('fuga')
      ]
    })
  })
})
