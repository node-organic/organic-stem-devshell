module.exports = function (plasma, dna) {
  let packagejson = require('../package.json')
  return function (data, cb) {
    cb(packagejson.version)
  }
}
