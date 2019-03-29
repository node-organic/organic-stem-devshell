# organic-dna-cells-info

extract cells info from dna branch

## usage

```js
// given dna branch

const dnaBranch = {
  'apis': {
    'v1': {
      'name': 'legacy-v1',
      'cellKind': 'test',
      'cellInfo': 'v1'
    },
    'v2': {
      'cellKind': 'test',
      'cellInfo': 'v1'
    },
    'cellKind': 'test',
    'cellInfo': 'v1'
  },
  'webapps': {
    '2018': {
      'client': {
        'cellKind': 'test',
        'cellInfo': 'v1'
      }
    }
  },
  'supervisor': {
    'cellKind': 'test',
    'cellInfo': 'v1'
  }
}

const cells = require('organic-dna-cells-info')(dnaBranch)
console.log(cells) // will print Array of CellInfo structures
```

## CellInfo

```
{
  dna: DNA, // cell's dna
  name: String, // cell's name
  groups: Array[String], // cell's groups
  dnaBranchPath: String // dot notated dna branch path
}
```

## notes

Cells are deep searched within given dna branch structure:

* every dna branch holding `cellKind` and `cellInfo` properties is considered a cell
* cell's groups are formed by their (deep) nesting level path concatenated with their implicit `groups` or `group` values
