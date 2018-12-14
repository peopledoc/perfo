/* eslint-env node */
'use strict'

/* eslint-disable no-console */

module.exports = function() {
  return {
    error(source, error) {
      console.error(
        `Error in ${source}:\n  `
          + `  ${error.message}\n`
          + `  (${error.code || 'no code'})`
      )
    }
  }
}
