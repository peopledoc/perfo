/* eslint-env node */
'use strict'

const { createHash } = require('crypto')
const { dirname, join } = require('path')
const request = require('request')
const createCache = require('./cache')

const CIRCLECI_API = 'https://circleci.com/api/v1.1'
const PROXY_PATH = '/circleci'

let {
  PERFO_ROOT_URL: ROOT_URL,
  PERFO_DATA_DIR: DATA_DIR,
  PERFO_CACHE_VALIDITY: CACHE_VALIDITY,
  PERFO_CIRCLECI_TOKEN: CIRCLE_TOKEN
} = process.env

if (!DATA_DIR) {
  DATA_DIR = join(dirname(__dirname), 'data')
}

module.exports = function(app) {
  let cache = createCache(
    join(DATA_DIR, 'cache'),
    Number(CACHE_VALIDITY) || 30 * 60 * 1000
  )

  let proxyPath = `${ROOT_URL || ''}${PROXY_PATH}`

  app.use(proxyPath, (req, res) => {
    let path = req.originalUrl.slice(proxyPath.length)

    let targetUrl = `${CIRCLECI_API}${path}`
    if (path.startsWith('/download')) {
      if (!req.query.url) {
        return res.status(400).send('Missing ̀`url` query parameter')
      }

      delete req.headers.authorization
      targetUrl = `${req.query.url}?circle-token=${CIRCLE_TOKEN}`
    }

    let auth = Buffer.from(`${CIRCLE_TOKEN}:`).toString('base64')
    let proxyHeaders = {
      Authorization: `Basic ${auth}`
    }

    if (req.headers.accept) {
      proxyHeaders.Accept = req.headers.accept
    }

    let cacheKey
    if (path === '/me') {
      cacheKey = `users/${CIRCLE_TOKEN}/me`
    } else if (path === '/projects') {
      cacheKey = `users/${CIRCLE_TOKEN}/projects`
    } else if (path.startsWith('/project/')) {
      if (path.endsWith('/artifacts')) {
        // /project/github/myorg/myproject/build/artifacts
        let [, , type, org, project, buildNum] = path.split('/')
        cacheKey = `projects/${type}.${org}.${project}/build-${buildNum}/artifacts`
      } else {
        // /project/github/myorg/myproject/tree/mybranch?limit=100
        let [, , type, org, project, , branchAndQuery] = path.split('/')
        let [branch, query] = branchAndQuery.split('?')
        cacheKey = `projects/${type}.${org}.${project}/branch-${branch}/${query}`
      }
    } else if (path.startsWith('/download')) {
      // https://3529-99822495-gh.circle-artifacts.com/0/home/circleci/employee-app-front/build-stats/top20.json'
      cacheKey = `downloads/${req.query.url
        .replace('https://', '')
        .replace(/\//g, '_')}`
    } else {
      let hash = createHash('sha256')
      hash.update(`${auth} ${req.method} ${targetUrl}`)
      cacheKey = `other/${hash.digest('hex')}`
    }

    cache(cacheKey, function() {
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
              resolve({ body: JSON.parse(body), status: response.statusCode })
            }
          }
        )
      })
    }).then(
      function(data) {
        res.status(data.status).send(JSON.stringify(data.body))
      },
      function(error) {
        res.status(500).send(error)
      }
    )
  })
}
