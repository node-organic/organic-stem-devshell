var fold = require('../index')
var expect = require('chai').expect
describe('issue #1', function () {
  it('folds array over string', function () {
    var root = {
      "modeA": {
        "property": [
          'array-value-1',
          'array-value-2'
        ]
      },
      "property": 'string-value'
    }
    fold(root, root.modeA)
    expect(root.property).to.eq(root.modeA.property)
  })
  it('folds array over boolean', function () {
    var root = {
      "modeA": {
        "property": [
          'array-value-1',
          'array-value-2'
        ]
      },
      "property": true
    }
    fold(root, root.modeA)
    expect(root.property).to.eq(root.modeA.property)
  })
})
