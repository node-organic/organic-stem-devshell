#!/usr/bin/env node
const path = require('path')
const opn = require('opn')
process.env.CELL_MODE = '_production'
process.env.PRJROOT = process.cwd()
process.chdir(path.join(__dirname, '../cells/server'))
let server = require('../cells/server')
server.start()
opn('http://localhost:8787')
