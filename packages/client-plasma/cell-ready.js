module.exports = function (plasma, dna) {
  require('domready')(() => {
    plasma.emit(dna.emitReady || 'cellReady')
  })
}
