/* eslint-env node */
'use strict'

module.exports = function() {
  return function(handler) {
    return function asyncUtilWrap(...args) {
      let fnReturn = handler(...args)
      let next = args[args.length - 1]
      return Promise.resolve(fnReturn).catch(next)
    }
  }
}
