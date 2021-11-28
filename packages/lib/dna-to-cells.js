const loadDNA = require('organic-dna-repo-loader')
const { getAllCells } = require('organic-dna-cells-info')
const {
  Cell
} = require('./chemicals')
const path = require('path')

module.exports = async function (root, existingCells = []) {
  const dna = await loadDNA({ root: root })
  if (!dna.cells) {
    throw new Error('failed to locate cells in ' + root + '/dna')
  }
  const found_cells = getAllCells(dna.cells)
  const updated_cells = found_cells.map((cellInfo) => {
    let scripts = []
    let dependencies = {}
    if (cellInfo.dna.cwd) {
      try {
        const packagejson = require(path.join(root, cellInfo.dna.cwd, 'package.json'))
        scripts = packagejson.scripts
        dependencies = Object.assign({}, packagejson.dependencies, packagejson.devDependencies)
      } catch (e) {
        // ignore
      }
    }
    let existingCell = {}
    for (let i = 0; i < existingCells.length; i++) {
      if (existingCells[i].name === cellInfo.name) {
        existingCell = existingCells[i]
      }
    }
    return Object.assign(existingCell, Cell.create({
      name: cellInfo.name,
      groups: cellInfo.groups,
      cwd: cellInfo.dna.cwd,
      selected: false,
      focused: false,
      commandRunning: false,
      runningCommandsCount: 0,
      port: dna['cell-ports'] ? dna['cell-ports'][cellInfo.name] : false,
      mountPoint: dna['cell-mountpoints'] ? dna['cell-mountpoints'][cellInfo.name] : false,
      scripts: scripts,
      dependencies: dependencies
    }))
  })
  return updated_cells
}
