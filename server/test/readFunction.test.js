const assert = require('assert')
const acorn = require('acorn')
const readFunction = require('../src/readFunction')
const Declaration = require('../src/lib/declaration')
const Reference = require('../src/lib/reference')
const Scope = require('../src/lib/scope')
const anonymous = require('../src/lib/anonymous')

describe('readFunction', () => {
  it('should make variable declarations', () => {
    const code = acorn.Parser.parse(`
    let a
    let a2 = 10
    const b = 'hoge'
    `)
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Declaration('a'),
      new Declaration('a2'),
      new Declaration('b')
    ]))
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
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Scope('obj1', [
        new Scope('a', [
          new Reference('a')
        ]),
        new Scope('b', [
          new Reference('a2')
        ])
      ])
    ]))
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
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Scope('fn1', [
        new Reference('a2')
      ]),
      new Scope('fn2', [
        new Reference('a2'),
        new Reference('b')
      ]),
      new Scope('fn3', [
        new Reference('obj1.a'),
        new Reference('obj1.b')
      ])
    ]))
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
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Scope('obj1', [
        new Scope('a', [
          new Reference('a'),
          new Reference('b'),
          new Reference('c'),
          new Reference('fn')
        ])
      ]),
      new Scope('a', [
        new Reference('a'),
        new Reference('b'),
        new Reference('c'),
        new Reference('obj1.fn')
      ])
    ]))
  })
  it('should support if statements', () => {
    const code = acorn.Parser.parse(`
    const a = "hoge"
    if (a === "hoge") {
      let b = a + c
      b += "fuga"
    } else if (b) ;
    else {
    }
    `)
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Declaration('a'),
      new Reference('a'),
      new Declaration('b'),
      new Reference('a'),
      new Reference('c'),
      new Reference('b'),
      new Reference('b')
    ]))
  })
  it('should support for array', () => {
    const code = acorn.Parser.parse(`
    const array = [a,b,c,10,...d]
    array[0] = 1
    `)
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Declaration('array'),
      new Reference('a'),
      new Reference('b'),
      new Reference('c'),
      new Reference('d'),
      new Reference('array')
    ]))
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
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Declaration('a'),
      new Declaration('b'),
      new Reference('call'),
      new Scope(anonymous, [
        new Declaration('a'),
        new Reference('b')
      ])
    ]))
  })
  it('should support for statements', () => {
    const code = acorn.Parser.parse(`
    for (let i = 0; i < 10; i++) {
      i++
    }
    let j = 0
    for (;;j++) {
      j++
    }
    `)
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Declaration('i'),
      new Reference('i'),
      new Reference('i'),
      new Reference('i'),
      new Declaration('j'),
      new Reference('j'),
      new Reference('j')
    ]))
  })
  it('should support for-of statements', () => {
    const code = acorn.Parser.parse(`
    for (let item of array) {
      item += '!'
    }
    `)
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Declaration('item'),
      new Reference('array'),
      new Reference('item')
    ]))
  })
  it('should support for-in statements', () => {
    const code = acorn.Parser.parse(`
    for (let item in array) {
      item += '!'
    }
    `)
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Declaration('item'),
      new Reference('array'),
      new Reference('item')
    ]))
  })
  it('should support while statements', () => {
    const code = acorn.Parser.parse(`
    while (true) {}
    while (i === 10) {
      i++
    }
    `)
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Reference('i'),
      new Reference('i')
    ]))
  })
  it('should support do-while statements', () => {
    const code = acorn.Parser.parse(`
    do {} while (true)
    do {
      i++
    } while (i === 10)
    `)
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Reference('i'),
      new Reference('i')
    ]))
  })
  it('should support immediate function', () => {
    const code = acorn.Parser.parse(`
    !function() { a() }();
    (function() { b() })()
    `)
    assert.deepEqual(readFunction(code), new Scope(null, [
      new Scope(anonymous, [
        new Reference('a')
      ]),
      new Scope(anonymous, [
        new Reference('b')
      ])
    ]))
  })
})
