const extract = require('../index')
test('extract cells info', () => {
  const dnaBranch = {
    'apis': {
      'v1': {
        'name': 'legacy-v1',
        'cellInfo': 'v1',
        'cellKind': 'test',
        'groups': ['legacy'],
        'build': {}
      },
      'v2': {
        'cwd': './v2',
        'cellInfo': 'v1',
        'cellKind': 'test',
        'build': {}
      },
      'cwd': './apis',
      'build': {},
      'cellInfo': 'v1',
      'cellKind': 'test'
    },
    'webapps': {
      '2018': {
        'client': {
          'cwd': './client',
          'build': {},
          'cellInfo': 'v1',
          'cellKind': 'test',
        }
      }
    }
  }
  let cells = extract(dnaBranch)
  expect(cells.length).toBe(4)
  expect(cells[0].name).toBe('apis')
  expect(cells[0].dna.cwd).toBe('./apis')
  expect(cells[0].groups).toEqual([])
  expect(cells[0].dnaBranchPath).toBe('apis')
  expect(cells[1].name).toBe('legacy-v1')
  expect(cells[1].groups).toEqual(['apis', 'legacy'])
  expect(cells[1].dnaBranchPath).toBe('apis.v1')
  expect(cells[2].dna.cwd).toBe('./v2')
  expect(cells[2].groups).toEqual(['apis'])
  expect(cells[2].dnaBranchPath).toBe('apis.v2')
  expect(cells[3].dna.cwd).toBe('./client')
  expect(cells[3].groups).toEqual(['webapps', '2018'])
  expect(cells[3].dnaBranchPath).toBe('webapps.2018.client')
})
