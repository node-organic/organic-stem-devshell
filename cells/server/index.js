const Cell = require('organic-stem-cell')
const path = require('path')

let cellInstance = new Cell({
  dnaSourcePaths: [
    path.resolve(__dirname, '../../dna')
  ],
  buildBranch: 'cells.server.build',
  cellRoot: __dirname
})
if (module.parent) {
  module.exports = cellInstance
} else {
  cellInstance.start()
}
