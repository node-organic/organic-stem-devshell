# organic-dna-loader

Simple utility module exporting function for loading and transforming DNA into
in-memory object representation.

Combines :

* "organic-dna-fsloader v1.1.0" for loading .json and .yaml files
* "organic-dna-cellmodes"
  * "organic-dna-fold"
  * "organic-dna-branches"
* "organic-dna-resolve"

## api & usage

* `process.env.CELL_MODE` if present is used to fold respective
`DNA[CELL_MODE]` branch into root unless `dnaMode` is provided as 
within options argument


### load from default `cwd + '/dna'`

```
var dnaLoader = require('organic-dna-loader')
dnaLoader(function(err, dna){

})
```

### load from custom directory

```
var dnaLoader = require('organic-dna-loader')
dnaLoader('./directory/dna', function(err, dna){

})
```

### load with options

```
var dnaLoader = require('organic-dna-loader')
dnaLoader({
  dnaSourcePath: './directory/dna',
  dnaMode: 'customMode'
}, function(err, dna){

})
```

### load from multiple sources


```
var dnaLoader = require('organic-dna-loader')
dnaLoader({
  dnaSourcePaths: [
    './directory/dna',
    './directory2/dna2'
  ],
  dnaMode: 'customMode'
}, function(err, dna){

})
```