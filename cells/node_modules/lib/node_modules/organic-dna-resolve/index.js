var selectBranch = require('organic-dna-branches').selectBranch
var clone = require('clone')

var re = {
  processEnv: /{\$[A-Z_]+}/g,
  processEnvStrip: /\$|{|}/g,
  reference: /^@[A-Za-z0-9_\-\.]+/,
  cloneReference: /^!@[A-Za-z0-9_\-\.]+/,
  selfReference: /&\{[A-Za-z0-9_\-\.]+\}/g,
  selfReferenceStrip: /&|{|}/g,
  referencePlaceholder: /@{[A-Za-z0-9_\-\.]+\}/g,
  referencePlaceholderStrip: /@|{|}/g,
}

var resolveValue = function(dna, query, rootDNA) {
  try {
    return resolveReferencePlaceholders(rootDNA || dna, selectBranch(dna, query), query)
  } catch(e) {
    console.log(dna, query)
    throw e
  }
}

var filterMatches = function (value, index, array) {
  return !index || value !== array[index - 1]
}

var resolveSelfReferencePlaceholders = function (rootDNA, dna, valueWithPlaceholdes, key) {
  var matches = valueWithPlaceholdes.match(re.selfReference).sort().filter(filterMatches)

  for (var i in matches) {
    var match = matches[i].replace(re.selfReferenceStrip, '')
    var value = resolveValue(dna, match, rootDNA)
    valueWithPlaceholdes = valueWithPlaceholdes.replace(new RegExp('&{' + match + '}', 'g'), value)
  }

  return valueWithPlaceholdes
}

var walkSelfReferences = function (dna, rootDNA) {
  for(var key in dna) {
    switch(true) {
      case Array.isArray(dna[key]):
        dna[key] = dna[key].map(function(item) {
          if (typeof item === 'string' && re.selfReference.test(item)) {
            return resolveSelfReferencePlaceholders(rootDNA, dna, item, key)
          }
          return walkSelfReferences(item, rootDNA)
        })
      break

      case typeof dna[key] == 'object':
        walkSelfReferences(dna[key], rootDNA)
      break

      case re.selfReference.test(dna[key]):
        dna[key] = resolveSelfReferencePlaceholders(rootDNA, dna, dna[key], key)
      break
    }
  }
  return dna
}

var resolveReferencePlaceholders = function (rootDNA, item, key) {
  switch(true) {

    case re.reference.test(item):
      return resolveValue(rootDNA, item.substr(1))
    break

    case re.cloneReference.test(item):
      return clone(resolveValue(rootDNA, item.substr(2)))
    break

    case re.referencePlaceholder.test(item):
      var matches = item.match(re.referencePlaceholder).sort().filter(filterMatches)

      for (var i in matches) {
        var match = matches[i].replace(re.referencePlaceholderStrip, '')
        var value = resolveValue(rootDNA, match)
        item = item.replace(new RegExp('@{' + match + '}', 'g'), value)
      }
      return item
    break

    case re.processEnv.test(item):
      var matches = item.match(re.processEnv).sort().filter(filterMatches)

      for (var i in matches) {
        var match = matches[i].replace(re.processEnvStrip, '')
        item = item.replace(new RegExp('{\\$' + match + '}', 'g'), process.env[match])
      }
      return item
    break

    default:
      return item
    break
  }
}

var walk = function(dna, rootDNA) {
  for(var key in dna) {
    switch(true) {
      case Array.isArray(dna[key]):
        dna[key] = dna[key].map(function(item) {
          if (typeof item === 'string') {
            return resolveReferencePlaceholders(rootDNA, item, key)
          }
          if (item['@']) {
            return resolveValue(rootDNA, item['@'])
          }
          if (item['!@']) {
            return clone(resolveValue(rootDNA, item['!@']))
          }
          walk(item, rootDNA)
          return item
        })
      break

      case typeof dna[key] == 'object':
        walk(dna[key], rootDNA)
      break

      default:
        dna[key] = resolveReferencePlaceholders(rootDNA, dna[key], key)
      break
    }
  }

  return dna
}

module.exports = function(rootDNA) {
  walkSelfReferences(rootDNA, rootDNA)
  walk(rootDNA, rootDNA)
}
