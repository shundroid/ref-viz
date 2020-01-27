import http from 'http'

let data = null

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
  res.end(JSON.stringify(data))
}).listen(8081)

export default _data => {
  data = _data
}
