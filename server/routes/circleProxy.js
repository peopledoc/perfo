/* eslint-env node */
'use strict'

const { createHash } = require('crypto')
const request = require('request')

const CIRCLE_API = 'https://circleci.com/api/v1.1'

module.exports = function(injections, app, routePrefix) {
  let {
    config: { circleToken, orgFilter },
    cache
  } = injections

  function filterOrg(data) {
    return orgFilter
      ? data.filter((project) => project.username === orgFilter)
      : data
  }

  app.use(routePrefix, (req, res) => {
    let path = req.originalUrl.slice(routePrefix.length)

    let targetUrl = `${CIRCLE_API}${path}`
    if (path.startsWith('/download')) {
      if (!req.query.url) {
        return res.status(400).send('Missing ̀`url` query parameter')
      }

      delete req.headers.authorization
      targetUrl = `${req.query.url}?circle-token=${circleToken}`
    }

    let auth = Buffer.from(`${circleToken}:`).toString('base64')
    let proxyHeaders = {
      Authorization: `Basic ${auth}`
    }

    if (req.headers.accept) {
      proxyHeaders.Accept = req.headers.accept
    }

    let cacheKey
    let postProcess = (data) => data

    if (path === '/me') {
      cacheKey = `users/${circleToken}/me`
    } else if (path === '/projects') {
      cacheKey = `users/${circleToken}/projects`
      postProcess = filterOrg
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
        res.status(data.status).send(JSON.stringify(postProcess(data.body)))
      },
      function(error) {
        res.status(500).send(error)
      }
    )
  })
}
