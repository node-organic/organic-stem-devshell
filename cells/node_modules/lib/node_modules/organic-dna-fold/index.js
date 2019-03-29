var walkAndFold = function(src, dest) {
  if(Array.isArray(src)) {
    for(var i = 0; i<src.length; i++) {
      var folded = false
      if(src[i]["$unshift"] !== undefined) {
        folded = true
        dest.unshift(src[i]["$unshift"])
      }
      if(src[i]["$push"] !== undefined) {
        folded = true
        dest.push(src[i]["$push"])
      }
      if(src[i]["$merge"] !== undefined) {
        folded = true
        for(var index in src[i]["$merge"])
          walkAndFold(src[i]["$merge"][index], dest[parseInt(index)])
      }
      if(src[i]["$insert"] !== undefined) {
        folded = true
        for(var index in src[i]["$insert"])
          dest.splice(parseInt(index),0, src[i]["$insert"][index])
      }
      if(!folded)
        dest[i] = src[i]
    }
  } else
  if(typeof src == "object") {
    for(var key in src) {
      if(Array.isArray(src[key])) {
        // check does folding needs to be override or merge
        if(key.indexOf("~") !== 0 && Array.isArray(dest[key])) {
          if(!dest[key])
            dest[key] = []
          // merge when not starting node name with ~ and destination is not Array
          walkAndFold(src[key], dest[key])
        } else {
          // override requested
          dest[key.replace("~","")] = src[key]
        }
      } else
      if(typeof src[key] == "object") {
        // check does folding needs to be override or merge
        if(key.indexOf("~") !== 0){
          if(!dest[key])
            dest[key] = {}
          // merge when not starting node name with ~
          walkAndFold(src[key], dest[key])
        } else
          // override requested
          dest[key.replace("~","")] = src[key]
      } else
        dest[key] = src[key]
    }
  }
}
module.exports = function(dna, branch) {
  walkAndFold(branch, dna)
}
