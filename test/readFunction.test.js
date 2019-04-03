const assert = require('assert')
const acorn = require('acorn')
const readFunction = require('../src/readFunction')
const Declaration = require('../src/lib/declaration')
const Reference = require('../src/lib/reference')
const convert = require('../src/lib/symbolForTest')

describe('readFunction', () => {
  it('should make variable declarations', () => {
    const code = acorn.Parser.parse(`
    let a
    let a2 = 10
    const b = 'hoge'
    `)
    assert.deepEqual(readFunction(['root'], code).declarations, [
      new Declaration('a', ['root']),
      new Declaration('a2', ['root']),
      new Declaration('b', ['root'])
    ])
  })
  it('should make object declarations', () => {
    const code = acorn.Parser.parse(`
    const obj1 = {
      a: function() {
        // reference
        a = 20
      },
      b: () => {
        a2 += 100
      }
    }
    `)
    assert.deepEqual(readFunction(['root'], code).declarations, [
      new Declaration('obj1', ['root']),
      new Declaration('a', ['root', 'obj1']),
      new Declaration('b', ['root', 'obj1']),
    ])
  })
  it('should make function declarations', () => {
    const code = acorn.Parser.parse(`
    // function declarations
    function fn1() {
      a2 += 100
    }
    const fn2 = () => {
      a2 += b
    }
    const fn3 = function() {
      obj1.a()
      obj1.b = ''
    }
    `)
    assert.deepEqual(readFunction(['root'], code).declarations, [
      new Declaration('fn1', ['root']),
      new Declaration('fn2', ['root']),
      new Declaration('fn3', ['root'])
    ])
  })
  it('should make references', () => {
    const code = acorn.Parser.parse(`
    const obj1 = {
      a: function() {
        a = 1
        b = c
        fn()
      }
    }
    function a() {
      a = 1
      b = c
      obj1.fn()
    }
    `)
    assert.deepEqual(readFunction(['root'], code).references, [
      new Reference('a', ['root', 'obj1', 'a']),
      new Reference('b', ['root', 'obj1', 'a']),
      new Reference('c', ['root', 'obj1', 'a']),
      new Reference('fn', ['root', 'obj1', 'a']),
      new Reference('a', ['root', 'a']),
      new Reference('b', ['root', 'a']),
      new Reference('c', ['root', 'a']),
      new Reference('obj1.fn', ['root', 'a'])
    ])
  })
  it('should support if statements', () => {
    const code = acorn.Parser.parse(`
    const a = "hoge"
    if (a === "hoge") {
      let b = a + c
      b += "fuga"
    }
    `)
    assert.deepEqual(readFunction(['root'], code), {
      declarations: [
        new Declaration('a', ['root']),
        new Declaration('b', ['root'])
      ],
      references: [
        new Reference('a', ['root']),
        new Reference('a', ['root']),
        new Reference('c', ['root']),
        new Reference('b', ['root'])
      ]
    })
  })
  it('should support for array', () => {
    const code = acorn.Parser.parse(`
    const array = [a,b,c,10,...d]
    `)
    assert.deepEqual(readFunction(['root'], code), {
      declarations: [
        new Declaration('array', ['root'])
      ],
      references: [
        new Reference('a', ['root']),
        new Reference('b', ['root']),
        new Reference('c', ['root']),
        new Reference('d', ['root'])
      ]
    })
  })
  it('should run deepEqual correctly in comparing Symbols', () => {
    assert.deepEqual(Symbol('a').toString(), Symbol('a').toString())
    assert.notDeepEqual(Symbol('a').toString(), Symbol('b').toString())
  })
  it('should make belongs of anonymous function', () => {
    const code = acorn.Parser.parse(`
    let a = 0, b

    call(function() {
      const a = b
    })
    `)
    const result = readFunction(['root'], code)
    convert(result.declarations)
    convert(result.references)
    assert.deepEqual(result, {
      declarations: [
        new Declaration('a', ['root']),
        new Declaration('b', ['root']),
        new Declaration('a', ['root', Symbol('anonymous').toString()])
      ],
      references: [
        new Reference('call', ['root']),
        new Reference('b', ['root', Symbol('anonymous').toString()])
      ]
    })
  })
})
