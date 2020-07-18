const Cell = require('organic-stem-cell')

let cellInstance = new Cell({
  dnaLoader: require('lib/load-root-dna'),
  buildBranch: 'cells.server.build',
  cellRoot: __dirname
})
if (module.parent) {
  module.exports = cellInstance
} else {
  cellInstance.start()
}
