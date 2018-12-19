/* eslint-env node */
'use strict'

module.exports = function(injections, app, routePrefix) {
  let { asyncHandler, ci } = injections

  app.get(
    `${routePrefix}/providers`,
    asyncHandler(async(req, res) => res.json(await ci.providers()))
  )

  app.get(
    `${routePrefix}`,
    asyncHandler(async(req, res) => {
      res.json(await ci.projects())
    })
  )

  app.get(
    `${routePrefix}/:id/builds/:branch`,
    asyncHandler(async(req, res) => {
      let builds = await ci.builds(req.params.id, req.params.branch)
      if (!builds) {
        res.sendStatus(404)
      } else {
        res.json(builds)
      }
    })
  )
}
