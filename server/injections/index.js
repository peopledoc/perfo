/* eslint-env node */
'use strict'

const requireDir = require('require-directory')
const subModules = requireDir(module)

const injections = {}
let lookupPath = []

for (let key in subModules) {
  let cachedKey = `_${key}`

  injections[cachedKey] = null
  injections.__defineGetter__(key, function() {
    if (!injections[cachedKey]) {
      if (lookupPath.indexOf(key) !== -1) {
        throw new Error(
          `Circular dependency: ${lookupPath.join(' > ')} > ${key}`
        )
      }
      lookupPath.push(key)
      injections[cachedKey] = subModules[key](injections)
    }

    lookupPath = []
    return injections[cachedKey]
  })
}

module.exports = injections
