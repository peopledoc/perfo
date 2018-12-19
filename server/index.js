/* eslint-env node */
'use strict'

const injections = require('./injections')
const routes = require('./routes')
const morgan = require('morgan')
const compression = require('compression')
const bodyParser = require('body-parser')

module.exports = function(app) {
  let {
    config: { rootURL, logFormat },
    logger
  } = injections

  app.use(morgan(logFormat))
  app.use(compression())
  app.use(bodyParser.json())

  routes.projects(injections, app, `${rootURL}projects`)
  routes.customGraphs(injections, app, `${rootURL}projects/:project/graphs`)

  app.use((err, req, res, next) => {
    logger.error('express error catching', err)

    if (res.headersSent) {
      return next(err)
    }

    res.sendStatus(500)
  })
}
