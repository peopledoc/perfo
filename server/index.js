/* eslint-env node */
'use strict'

const injections = require('./injections')
const routes = require('./routes')
const morgan = require('morgan')

module.exports = function(app) {
  let {
    config: { rootURL, logFormat }
  } = injections

  app.use(morgan(logFormat))
  routes.customGraphs(injections, app, `${rootURL}custom-graphs`)
  routes.circleProxy(injections, app, `${rootURL}circleci`)
}
