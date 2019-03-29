# organic-dna-cellmodes

Simple utility function to fold and merge DNA structure based on given value.

## selectedModes(dna, value)

* `dna` is a tree-like `organic-dna` structure
* `value` is a string
  * it can contain a `+` character which will trigger multiple folding operations
  * it can contain a `.` character which will trigger a folding operation on a sub-branch
  * both `+` and `.` can be combined infinitely

## example

    var selectModes = require("organic-dna-cellmodes")
    selectModes(dna, process.env.CELL_MODE)
    // based on CELL_MODE environment variable one can fold DNA 
    // once via CELL_MODE=existingBranch
    // many times via CELL_MODE=existingBranch1+existingBranch2
    // many times with sub-branches via CELL_MODE=existingBranch1+existingBranch2+existingBranch2.subbranch