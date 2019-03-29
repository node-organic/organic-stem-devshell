# organic-dna-fsloader

File System based loading of dna methods.

# api

## loadDir(dna, dirPath, [ namespace, ] callback)

Loads all (.json|.yaml|.yml) files found recursively in `dirPath` and mounts constructed object into `dna`.

* `dna`: Object - the dna instance on which will contain the loaded data
* `dirPath`: String - path to directory containing .json files
* `namespace`: String - optional, dot notated path to existing branch which should hold loaded data. By default it is '' pointing to the root of the `dna` reference.
* `callback`: Function(err){} - will be invoked once loading is complete
  
Uses internally `loadFile` method

## loadFile(dna, filePath, [ namespace, ] callback)

Loads a single file (.json|.yaml|.yml) parsing its contents as JSON structure and mounts into `dna`.

* `dna`: Object - the dna instance on which will contain the loaded data
* `filePath`: String - path to file containing JSON structure
* `namespace`: String - optional, dot notated path to existing branch which should hold loaded data. By default it is '' pointing to the root of the `dna` reference.
* `callback`: Function(err){} - will be invoked once loading is complete
  
YAML support includes parsing single or multi-document yaml files.
Loading .json and .yaml files for the same namespace merges their contents.