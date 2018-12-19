/* eslint-env node */
'use strict'

/* eslint-disable no-console */

module.exports = function() {
  function debug(source, ...items) {
    console.debug(
      `DEBUG - ${source}${items.length ? ':\n  ' : ''}`,
      items.map((item) => `  ${item}`).join('\n')
    )
  }

  function error(source, error) {
    let message
      = typeof error === 'string'
        ? error
        : `  ${error.message}\n  (${error.code || 'no code'})`
    console.error(`ERROR - in ${source}:\n${message}`)
  }

  return {
    debug,
    error
  }
}
