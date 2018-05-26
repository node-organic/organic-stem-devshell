const ProjectChemical = require('../chemicals/project')

module.exports = function (plasma, dna) {
  return function () {
    plasma.emit(ProjectChemical.scan)
  }
}
