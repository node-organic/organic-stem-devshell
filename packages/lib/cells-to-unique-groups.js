const {
  Group
} = require('./chemicals')
const _ = require('lodash')

module.exports = function (cells) {
  const names = _.uniq(_.flatten(cells.map(v => v.groups)))
  return names.map(name => {
    return Group.create({
      name: name,
      selected: false
    })
  })
}
