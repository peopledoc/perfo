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
  let cache = {}
  let CACHE_VALIDITY = 30 * 60 * 1000
  let CIRCLECI_API = 'https://circleci.com/api/v1.1'
  let PROXY_PATH = '/circleci'

  app.use(PROXY_PATH, (req, res) => {
    let path = req.originalUrl.slice(PROXY_PATH.length)
    let auth = req.headers.authorization

    if (!auth) {
      return res.status(403).send('Authorization required')
    }

    let targetUrl = `${CIRCLECI_API}${path}`
    if (path.startsWith('/download')) {
      if (!req.query.url) {
        return res.status(400).send('Missing ̀`url` query parameter')
      }

      let [token] = Buffer.from(auth.replace(/^Basic /, ''), 'base64')
        .toString()
        .split(':')
      delete req.headers.authorization
      targetUrl = `${req.query.url}?circle-token=${token}`
    }

    let proxyHeaders = { Authorization: auth }

    if (req.headers.accept) {
      proxyHeaders.Accept = req.headers.accept
    }

    let now = new Date()
    for (let key in cache) {
      if (cache[key].validUntil <= now) {
        delete cache[key]
      }
    }

    let cacheKey = `${auth} ${req.method} ${targetUrl}`
    if (cacheKey in cache) {
      let cached = cache[cacheKey]
      res.status(cached.status).send(cached.body)
      return
    }

    let jar = request.jar()
    request(
      {
        url: targetUrl,
        method: req.method,
        headers: proxyHeaders,
        jar
      },
      (error, response, body) => {
        if (error) {
          res.status(500).send(error)
        } else {
          if (response.statusCode < 300) {
            cache[cacheKey] = {
              body,
              status: response.statusCode,
              validUntil: now + CACHE_VALIDITY
            }
          }

          res.status(response.statusCode).send(body)
        }
      }
    )
  })
}
