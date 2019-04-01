const acorn = require('acorn')
const fs = require('fs')

fs.readFile('./test-files/main.js', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(acorn.Parser.parse(data.toString()))
})
