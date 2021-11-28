#!/usr/bin/env node
const { exec } = require('child_process')
const path = require('path')
const opn = require('opn')

process.env.PRJROOT = process.cwd()
process.chdir(path.join(__dirname, '../'))
const child = exec('npm run develop')
child.stderr.pipe(process.stderr)
child.stdout.pipe(process.stdout)
child.on('exit', function (code) {
  process.exit(code)
})
opn('http://localhost:8788')
