var path = require('path')

var DNA = require('organic').DNA
var loadDir = require('organic-dna-fsloader').loadDir
var resolve = require('organic-dna-resolve')
var selectModes = require('organic-dna-cellmodes')
var async = require('async')

module.exports = function loadDna (src, next) {
  var dnaSourcePaths = src
  var dnaMode = process.env.CELL_MODE
  if (!Array.isArray(src)) {
    dnaSourcePaths = [src]
  }
  if (typeof src === 'function') {
    next = src
    dnaSourcePaths = [path.join(process.cwd(), 'dna')]
  }
  if (typeof src === 'object' && !Array.isArray(src)) {
    if (src.dnaSourcePath) {
      dnaSourcePaths = [src.dnaSourcePath]
    }
    if (src.dnaSourcePaths) {
      dnaSourcePaths = src.dnaSourcePaths
    }
    if (src.dnaMode) {
      dnaMode = src.dnaMode
    }
  }

  var dna = new DNA()
  async.eachSeries(dnaSourcePaths, function (dnaPath, nextDna) {
    loadDir(dna, dnaPath, function (err) {
      if (err) return nextDna(err)
      // fold dna based on cell mode
      if (dnaMode) {
        try {
          selectModes(dna, dnaMode)
        } catch (e) {
          return nextDna(e)
        }
      }
      nextDna()
    })
  }, function (err) {
    if (err) return next(err)

    try {
      // resolve any referrences
      resolve(dna)
    } catch (e) {
      return next(e)
    }

    next(null, dna)
  })
}
