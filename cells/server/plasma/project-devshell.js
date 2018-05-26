const loadDNA = require('organic-dna-loader')
const path = require('path')
const ProjectChemical = require('../chemicals/project')
const userhome = require('userhome')

module.exports = class ProjectDevshell {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.projectRoot = process.cwd()
    if (process.env.PRJ_ROOT) {
      this.projectRoot = path.resolve(process.env.PRJ_ROOT)
    }
    this.runningCommands = []
    this.plasma.on(ProjectChemical.scan, this.scanCWD, this)
  }

  scanCWD () {
    loadDNA({
      dnaSourcePaths: [
        path.join(this.projectRoot, 'dna')
      ]
    }, (err, dna) => {
      if (err) {
        console.error(err)
        return
      }
      let cells = []
      for (let key in dna.cells) {
        cells.push({
          name: key,
          groups: dna.cells[key].groups
        })
      }
      this.plasma.emit(new ProjectChemical({
        userhome: userhome(),
        cwd: this.projectRoot,
        cells: cells,
        runningCommands: this.runningCommands
      }))
    })
  }
}
