const http = require('http')
const httpProxy = require('http-proxy')
const url = require('url')

const {
  ClientState
} = require('../../../lib/chemicals')

const CellProxyRules = class {
  constructor (cells) {
    this.rules = []
    cells.forEach((cell) => {
      if (!cell.port || !cell.mountPoint) return
      let cellPort = cell.port
      let mountPoint = cell.mountPoint
      this.add({
        name: cell.name,
        targetPoint: `http://localhost:${cellPort}`,
        mountPoint: mountPoint
      })
    })
  }
  add (options) {
    if (options.mountPoint.indexOf('/') !== 0) {
      options.mountPoint = '/' + options.mountPoint
    }
    let value = '^' + options.mountPoint + '\\W*'
    options.regex = new RegExp(value, 'u')
    this.rules.push(options)
    this.sortRules()
  }
  sortRules () {
    this.rules.sort(function (a, b) {
      return b.mountPoint.length - a.mountPoint.length
    })
  }
  match (req) {
    for (let i = 0; i < this.rules.length; i++) {
      let urlToTest = url.parse(req.url).pathname
      if (this.rules[i].regex.test(urlToTest)) {
        return this.rules[i]
      }
    }
  }

  toString () {
    if (this.rules.length === 0) return '[no rules]'
    return this.rules.map((r) => {
      return JSON.stringify(r)
    }).join('\n')
  }
}

module.exports = function (plasma, dna) {
  let port = dna.port
  let proxy = httpProxy.createProxy()
  let rules = null

  plasma.on(ClientState.type, (c) => {
    rules = new CellProxyRules(c.cells)
  })

  proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    })
    res.end(err.stack)
  })

  http.createServer(function (req, res) {
    if (rules) {
      let result = rules.match(req)
      if (result) {
        console.info('[', result.name, ']', req.url, '->', result.targetPoint)
        if (result.mountPoint.lastIndexOf('/') !== result.mountPoint.length - 1) {
          req.url = req.url.replace(result.mountPoint, '')
        }
        return proxy.web(req, res, {
          target: result.targetPoint
        })
      }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    if (!rules) return res.end('Load devshell to populate dev proxy rules')
    res.end('The request url and path did not match any of the cells ' + rules.toString())
  }).listen(port, () => {
    console.info('dev-proxy listening on', port)
  })
}
