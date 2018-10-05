/* eslint-env node */
'use strict'

module.exports = function(app) {
  let globSync = require('glob').sync
  let mocks = globSync('./mocks/**/*.js', { cwd: __dirname }).map(require)
  let proxies = globSync('./proxies/**/*.js', { cwd: __dirname }).map(require)

  // Log proxy requests
  let morgan = require('morgan')
  app.use(morgan('dev'))

  mocks.forEach((route) => route(app))
  proxies.forEach((route) => route(app))

  // CircleCI API proxy
  let request = require('request')
  let CIRCLECI_API = 'https://circleci.com/api/v1.1'
  let PROXY_PATH = '/circleci'
  app.use(PROXY_PATH, (req, res) => {
    let path = req.originalUrl.slice(PROXY_PATH.length)
    let auth = req.headers.authorization

    if (!auth) {
      return res.status(403).send('Authorization required')
    }

    let proxyUrl = `${CIRCLECI_API}${path}`
    let proxyHeaders = { Authorization: auth }

    if (req.headers.accept) {
      proxyHeaders.Accept = req.headers.accept
    }

    request(
      {
        url: proxyUrl,
        method: req.method,
        headers: proxyHeaders
      },
      (error, response, body) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(response.statusCode).send(body)
        }
      }
    )
  })
}
