const loadDNA = require('organic-dna-repo-loader')
const path = require('path')

module.exports = function (mode) {
  return loadDNA({
    root: path.join(__dirname, '..', '..'),
    mode,
    skipExistingLoaderUsage: true
  })
}
