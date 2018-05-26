const express = require('express')
const path = require('path')
module.exports = function (plasma, dna, next) {
  let app = express()
  app.use(express.static(path.join(__dirname, '../client/dist')))
  next(null, app)
}
