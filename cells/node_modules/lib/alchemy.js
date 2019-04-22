module.exports.define = function (props) {
  let schemaProps = {}
  for (let key in props) {
    if (props[key] === String || props[key] === Number ||
      props[key] === Object || props[key] === Array ||
      props[key] === Date || props[key] === Boolean) {
      schemaProps[key] = props[key]
      delete props[key]
    }
  }
  return {
    ...props,
    create: function (options) {
      let cleanoptions = Object.assign({}, options)
      delete cleanoptions.type
      return Object.assign({}, props, cleanoptions)
    }
  }
}

module.exports.extend = function (base, props) {
  let cleanbase = Object.assign({}, base)
  delete cleanbase.craete
  return Object.assign({...cleanbase}, props, {
    create: function (options) {
      let cleanoptions = Object.assign({}, options)
      delete cleanoptions.type
      return Object.assign({}, cleanbase, props, cleanoptions)
    }
  })
}
