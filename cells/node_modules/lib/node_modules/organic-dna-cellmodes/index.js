var fold = require("organic-dna-fold")
var has = require("lodash.has")
var selectBranch = require("organic-dna-branches").selectBranch

module.exports = function(dna, value){
  var modes = value.split("+")
  modes.forEach(function(m){
    if(dna[m] || has(dna, m))
      fold(dna, selectBranch(dna, m))
    else
      console.warn("mode ",m," not found in root dna")
  })
}