# organic-dna-branches

Helper methods for organic DNA branch based manipulations.

# api

## createBranch(dna, namespace, value)

Creates branch at given `namespace` with its respective `value`.

* `dna`: Object - the dna instance on which will contain the created branch.
* `namespace`: String - dot notated path, eg "branch.sub-branch.property".

## selectBranch(dna, namespace)

Queries the DNA object using dot notated `namespace` and returns respective end-branch `value`.

* `dna`: Object - the dna instance on which will contain the loaded data
* `namespace`: String - dot notated path to existing branch.