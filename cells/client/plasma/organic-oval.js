/* global oval */
module.exports = function (plasma, dna) {
  oval.init(plasma)
  plasma.emit('oval-ready')
  require('domready')(function () {
    oval.mountAll(document.body)
  })
}
