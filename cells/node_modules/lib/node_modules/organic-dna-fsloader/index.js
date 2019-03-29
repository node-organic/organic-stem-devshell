var util = require("util")
var glob = require("glob");
var fs = require("fs");
var path = require("path");
var createBranch = require("organic-dna-branches").createBranch
var selectBranch = require("organic-dna-branches").selectBranch
var YAML = require("yaml")

module.exports.loadDir = function(dna, dirPath, namespace, callback) {
  if(typeof namespace == "function") {
    callback = namespace;
    namespace = "";
  }

  dirPath = path.normalize(dirPath);

  glob(dirPath+"/**/*.@(json|yaml|yml)", function(err, files){
    if(err) return callback(err)
    var filesLeft = files.length;
    if(filesLeft == 0)
      return callback()
    files.forEach(function(file){
      file = path.normalize(file);
      // append namespace tail from file path
      // tail is in form X.Y.Z where '.' are path delimiters
      var target = file.replace(dirPath+path.sep, "")
        .replace(".json", "")
        .replace(".yaml", "")
        .replace(".yml", "")
        .replace(/\//g, ".")
        .replace(/\\/g, ".");

      if(namespace != "")
        target = namespace+"."+target; // insert '.' as namespace should be in form X.Y.Z without trailing '.'
      
      // load file data at given namespaced branch
      module.exports.loadFile(dna, file, target, function(err){
        if(err) return callback(err)
        filesLeft -= 1;
        if(filesLeft == 0)
          callback();
      });
    });
  });
}

module.exports.loadFile = function(dna, filePath, namespace, callback){
  if(typeof namespace == "function") {
    callback = namespace;
    namespace = "";
  }
  fs.readFile(filePath, function(err, data){
    if(err) return callback(err)
    data = data.toString();
    try {
      switch(path.extname(filePath)) {
        case '.json':
          data = JSON.parse(data);
        break
        case '.yaml':
        case '.yml':
          data = YAML.parseAllDocuments(data).map(function (item) {
            return item.toJSON()
          })
          if (data.length === 1) {
            data = data[0]
          }
        break
      }
    }catch(e) {
      return callback(new Error("Failed to parse "+data+" at "+filePath+" given error "+e.message))
    }
    /* 
      quick merge into existing nodes
      useful for having the configuration per namespace/branch split
      into .yaml and .json files
    */
    try {
      let existing = selectBranch(dna, namespace)
      if (typeof existing === 'object') {
        data = Object.assign({}, existing, data) 
      }
    } catch (nonExistingNamespaceErr) {
      // ignore non existing branch errors 
      // createBranch is going create the namespace path anyway
    }
    createBranch(dna, namespace, data);
    callback();
  });
}