module.exports.define = function (props) {
  let defaultProps = {}
  for (let key in props) {
    if (props[key] === String || props[key] === Number ||
      props[key] === Object || props[key] === Array ||
      props[key] === Date) {
      defaultProps[key] = props[key]
      delete props[key]
    }
  }
  return {
    ...props,
    create: function (options) {
      let cleanoptions = {}
      for (let key in options) {
        if (key === 'type') continue
        cleanoptions[key] = options[key]
      }
      return Object.assign({}, props, cleanoptions)
    }
  }
}

module.exports.extend = function (base, props) {
  let cleanbase = {}
  for (let key in base) {
    if (key === 'create') continue
    cleanbase[key] = base[key]
  }
  return Object.assign({...cleanbase}, props, {
    create: function (options) {
      let cleanoptions = {}
      for (let key in options) {
        if (key === 'type') continue
        cleanoptions[key] = options[key]
      }
      return Object.assign({}, cleanbase, props, cleanoptions)
    }
  })
}
