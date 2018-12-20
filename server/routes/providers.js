/* eslint-env node */
'use strict'

module.exports = function(injections, app, routePrefix) {
  let { asyncHandler, ci } = injections

  app.get(
    `${routePrefix}`,
    asyncHandler(async(req, res) => res.json(await ci.providers()))
  )
}
