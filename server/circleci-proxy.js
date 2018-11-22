/* eslint-env node */
'use strict'

const { dirname, join } = require('path')
const request = require('request')
const createCache = require('./cache')

const CIRCLECI_API = 'https://circleci.com/api/v1.1'
const PROXY_PATH = '/circleci'

const { PERFO_CACHE_DIR, PERFO_CACHE_VALIDITY } = process.env

module.exports = function(app) {
  let cache = createCache(
    PERFO_CACHE_DIR || join(dirname(__dirname), 'cache'),
    Number(PERFO_CACHE_VALIDITY) || 30 * 60 * 1000
  )

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

    cache(`${auth} ${req.method} ${targetUrl}`, function() {
      return new Promise((resolve, reject) => {
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
              reject(error)
            } else {
              resolve({ body, status: response.statusCode })
            }
          }
        )
      })
    }).then(
      function(data) {
        res.status(data.status).send(data.body)
      },
      function(error) {
        res.status(500).send(error)
      }
    )
  })
}
