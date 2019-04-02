const assert = require('assert')
const acorn = require('acorn')

const toStringMemberExpression = require('../src/toStringMemberExpression')

describe('toStringMemberExpression', () => {
  it('should convert nested object to string', () => {
    const code = acorn.Parser.parse(`
    a.b.c.d.e = "success"
    `)
    assert.equal(toStringMemberExpression(code.body[0].expression.left),
      'a.b.c.d.e')
  })
})
