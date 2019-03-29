module.exports.createBranch = function(dna, namespace, value) {

  // merge value if the namespace is the dna itself (namespace equal to "")
  if(namespace == "" && value) {
    if(typeof value == "object") {
      for(var key in value)
        dna[key] = value[key];
    } else
      throw new Error("can not set primitive value to dna structure (error while trying dna = value)");
    return;
  }

  var b = dna;
  var currentB = "";
  var lastP = "", lastB = b;

  // iterate namaspace and create holder objects if they do not exist
  namespace.split(".").forEach(function(p){
    if(b[p] === undefined)
      b[p] = {};
    if(typeof b[p] != "object")
      throw new Error("can not create branch path at value "+p+" using "+currentB);
    currentB += "."+p;
    lastP = p;
    lastB = b;
    b = b[p];
  });

  // assign value to last branch
  if(value !== undefined)
    lastB[lastP] = value;
}

module.exports.selectBranch = function(dna, namespace) {
  if(namespace == "")
    return dna;
  if(namespace.indexOf(".") === -1)
    return dna[namespace];
  var b = dna;
  var currentB = "";
  namespace.split(".").forEach(function(p){
    if(b[p] !== undefined)
      b = b[p];
    else
      throw new Error("can not walk to branch '"+namespace+"' found gap at "+currentB);
    currentB += "."+p;
  });
  return b;
}
