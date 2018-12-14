/* eslint-env node */
'use strict'

const injections = require('./injections')
const routes = require('./routes')
const morgan = require('morgan')

module.exports = function(app) {
  let {
    config: { rootURL, logFormat },
    logger
  } = injections

  app.use(morgan(logFormat))

  routes.customGraphs(injections, app, `${rootURL}custom-graphs`)
  routes.circleProxy(injections, app, `${rootURL}circleci`)

  app.use((err, req, res, next) => {
    logger.error('express error catching', err)

    if (res.headersSent) {
      return next(err)
    }

    res.sendStatus(500)
  })
}
