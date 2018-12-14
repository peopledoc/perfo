/* eslint-env node */
'use strict'

const { createHash } = require('crypto')

const CIRCLE_API = 'https://circleci.com/api/v1.1'

module.exports = function(injections) {
  let {
    config: { circleToken },
    cache,
    circlePathHandlers,
    request: { single }
  } = injections

  return async function(method, path, query, headers) {
    let auth = Buffer.from(`${circleToken}:`).toString('base64')
    let proxyHeaders = {
      Authorization: `Basic ${auth}`
    }

    if (headers.accept) {
      proxyHeaders.Accept = headers.accept
    }

    let targetUrl = `${CIRCLE_API}${path}`
    let postProcessor = (data) => data
    let requestor = single
    let cacheKey, data

    for (let handler of circlePathHandlers) {
      if (
        (typeof handler.match === 'string' && path === handler.match)
        || (handler.match instanceof RegExp && path.match(handler.match))
      ) {
        cacheKey = handler.cacheKey(path, query)

        if ('requestor' in handler) {
          requestor = handler.requestor(path)
        }

        if ('postProcessor' in handler) {
          postProcessor = handler.postProcessor(path)
        }

        if ('targetUrl' in handler) {
          targetUrl = handler.targetUrl(path, query)
        }

        break
      }
    }

    if (!cacheKey) {
      let hash = createHash('sha256')
      hash.update(`${auth} ${method} ${targetUrl}`)
      cacheKey = `other/${hash.digest('hex')}`
    }

    data = await cache(cacheKey, function() {
      return requestor(targetUrl, method, proxyHeaders)
    })

    return { status: data.status, body: await postProcessor(data.body) }
  }
}
