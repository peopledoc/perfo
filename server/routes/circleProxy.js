/* eslint-env node */
'use strict'

module.exports = function(injections, app, routePrefix) {
  let { circleRequest, asyncHandler, logger } = injections

  app.use(
    routePrefix,
    asyncHandler(async(req, res) => {
      let path = req.originalUrl.slice(routePrefix.length)
      let data

      try {
        data = await circleRequest(req.method, path, req.query, req.headers)
      } catch(e) {
        logger.error(`circleProxy ${path}`, e)
        throw e
      }

      res.status(data.status).json(data.body)
    })
  )
}
