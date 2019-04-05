const assert = require('assert')
const acorn = require('acorn')
const readFunction = require('../src/readFunction')
const Declaration = require('../src/lib/declaration')
const Reference = require('../src/lib/reference')
const anonymous = require('../src/lib/anonymous')

describe('readFunction', () => {
  it('should make variable declarations', () => {
    const code = acorn.Parser.parse(`
    let a
    let a2 = 10
    const b = 'hoge'
    `)
    assert.deepEqual(readFunction([], code), {
      items: [
        new Declaration('a'),
        new Declaration('a2'),
        new Declaration('b')
      ],
      scopes: {}
    })
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
    assert.deepEqual(readFunction([], code), {
      items: [
        new Declaration('obj1')
      ],
      scopes: {
        obj1: {
          items: [
            new Declaration('a'),
            new Declaration('b'),
          ],
          scopes: {
            a: {
              items: [
                new Reference('a')
              ],
              scopes: {}
            },
            b: {
              items: [
                new Reference('a2')
              ],
              scopes: {}
            }
          }
        }
      }
    })
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
    assert.deepEqual(readFunction([], code), {
      items: [
        new Declaration('fn1'),
        new Declaration('fn2'),
        new Declaration('fn3')
      ],
      scopes: {
        fn1: {
          items: [new Reference('a2')],
          scopes: {}
        },
        fn2: {
          items: [
            new Reference('a2'),
            new Reference('b')
          ],
          scopes: {}
        },
        fn3: {
          items: [
            new Reference('obj1.a'),
            new Reference('obj1.b')
          ],
          scopes: {}
        }
      }
    })
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
    assert.deepEqual(readFunction([], code), {
      items: [
        new Declaration('obj1'),
        new Declaration('a')
      ],
      scopes: {
        obj1: {
          items: [
            new Declaration('a')
          ],
          scopes: {
            a: {
              items: [
                new Reference('a'),
                new Reference('b'),
                new Reference('c'),
                new Reference('fn')
              ],
              scopes: {}
            }
          }
        },
        a: {
          items: [
            new Reference('a'),
            new Reference('b'),
            new Reference('c'),
            new Reference('obj1.fn')
          ],
          scopes: {}
        }
      }
    })
  })
  it('should support if statements', () => {
    const code = acorn.Parser.parse(`
    const a = "hoge"
    if (a === "hoge") {
      let b = a + c
      b += "fuga"
    }
    `)
    assert.deepEqual(readFunction([], code), {
      items: [
        new Declaration('a'),
        new Reference('a'),
        new Declaration('b'),
        new Reference('a'),
        new Reference('c'),
        new Reference('b'),
      ],
      scopes: {}
    })
  })
  it('should support for array', () => {
    const code = acorn.Parser.parse(`
    const array = [a,b,c,10,...d]
    array[0] = 1
    `)
    assert.deepEqual(readFunction([], code), {
      items: [
        new Declaration('array'),
        new Reference('a'),
        new Reference('b'),
        new Reference('c'),
        new Reference('d'),
        new Reference('array')
      ],
      scopes: {}
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
    const expectedResult = {
      items: [
        new Declaration('a'),
        new Declaration('b'),
        new Reference('call')
      ],
      scopes: {}
    }
    expectedResult[anonymous] = {
      items: [
        new Declaration('a'),
        new Reference('b')
      ]
    }
    assert.deepEqual(readFunction([], code), expectedResult)
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
    assert.deepEqual(readFunction([], code), {
      items: [
        new Declaration('i'),
        new Reference('i'),
        new Reference('i'),
        new Reference('i'),
        new Declaration('j'),
        new Reference('j'),
        new Reference('j')
      ],
      scopes: {}
    })
  })
  it('should support for-of statements', () => {
    const code = acorn.Parser.parse(`
    for (let item of array) {
      item += '!'
    }
    `)
    assert.deepEqual(readFunction([], code), {
      items: [
        new Declaration('item'),
        new Reference('array'),
        new Reference('item')
      ],
      scopes: {}
    })
  })
  it('should support for-in statements', () => {
    const code = acorn.Parser.parse(`
    for (let item in array) {
      item += '!'
    }
    `)
    assert.deepEqual(readFunction([], code), {
      items: [
        new Declaration('item'),
        new Reference('array'),
        new Reference('item')
      ],
      scopes: {}
    })
  })
  it('should support while statements', () => {
    const code = acorn.Parser.parse(`
    while (true) {}
    while (i === 10) {
      i++
    }
    `)
    assert.deepEqual(readFunction([], code), {
      items: [
        new Reference('i'),
        new Reference('i')
      ],
      scopes: {}
    })
  })
  it('should support do-while statements', () => {
    const code = acorn.Parser.parse(`
    do {} while (true)
    do {
      i++
    } while (i === 10)
    `)
    assert.deepEqual(readFunction([], code), {
      items: [
        new Reference('i'),
        new Reference('i')
      ],
      scopes: {}
    })
  })
})
