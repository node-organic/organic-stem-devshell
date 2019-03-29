# organic-dna-fold

DNA utility function folding DNA structure with support for array manupulations and node overriding

## api and usage

    var fold = require("organic-dna-fold")
    var DNA = require("organic").DNA
    var dna = new DNA({
      "modeA": {
        "property": "new value"
      },
      "property": "value",
      "anotherOne": "value"
    })

    fold(dna, dna.modeA) // fold modeA branch over dna root

    console.log(dna.property) // == "new value"
    console.log(dna.anotherOne) // == "value"

### folding with override instead of merge

    var dna = new DNA({
      "modeA": {
        "~plasma": {
          "property": "value"
        },
        "~array": []
      },
      "plasma": {
        "property": "",
        "anotherOne": ""
      },
      "array": ["a", "b", "c"]
    })

    fold(dna, dna.modeA)

    console.log(dna.anotherOne) // == undefined
    console.log(dna.property) // == "value"

    console.log(dna.array) // == []

### folding and push to array merge

    var dna = new DNA({
      "modeA": {
        "array": [
          {
            "$push": "atEndOfArray"
          }
        ]
      },
      "array": ["0", 1]
    })

    fold(dna, dna.modeA)

    console.log(dna.array) // == ["0", 1, "atEndOfArray"]

### folding and unshift to array merge

    var dna = new DNA({
      "modeA": {
        "array": [
          {
            "$unshift": "atStartOfArray"
          }
        ]
      },
      "array": ["0", 1]
    })

    fold(dna, dna.modeA)

    console.log(dna.array) // == ["atStartOfArray", "0", 1]

### folding and insert to array

    var dna = new DNA({
      "modeA": {
        "array": [
          {
            "$insert": {
              "1": "atMiddleOfArray"
            }
          }
        ]
      },
      "array": ["0", 1]
    })

    fold(dna, dna.modeA)

    console.log(dna.array) // == ["0", "atMiddleOfArray", 1]

### folding and merge array element

    var dna = new DNA({
      "modeA": {
        "array": [
          {
            "$merge": {
              "2": {
                "newProperty": true
              }
            }
          }
        ]
      },
      "array": ["0", 1, { property: "value" }]
    })

    fold(dna, dna.modeA)

    console.log(dna.array) // == ["0", 1, { property:"value", "newProperty": true }]