#!/usr/bin/env node
const path = require('path')
const opn = require('opn')
process.env.PRJROOT = process.cwd()
process.chdir(path.join(__dirname, '../cells/server'))
let server = require('../cells/server')
server.start('_production')
opn('http://localhost:8787')
