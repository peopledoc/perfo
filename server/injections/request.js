/* eslint-env node */
'use strict'

const request = require('request')

module.exports = function(injections) {
  let { logger } = injections

  function single(url, method, headers) {
    return new Promise((resolve, reject) => {
      let jar = request.jar()
      logger.debug(`single ${method} ${url}`)
      request(
        {
          url,
          method,
          headers,
          jar
        },
        (error, response, body) => {
          if (error) {
            logger.debug(`single ${method} ${url} error`)
            reject(error)
          } else {
            let parsed
            try {
              parsed = JSON.parse(body)
            } catch(e) {
              reject(
                new Error(
                  `Invalid JSON (status = ${response.statusCode}):\n${body}`
                )
              )
            }

            logger.debug(`single ${method} ${url} ${response.statusCode}`)
            resolve({
              body: parsed,
              status: response.statusCode
            })
          }
        }
      )
    })
  }

  function buildPageUrl(baseUrl, offset, query, pagination) {
    query = Object.assign({}, query)
    query[pagination.offsetParam] = offset
    query[pagination.limitParam] = pagination.limit

    let queryString = Object.keys(query)
      .reduce(
        (params, key) =>
          params.concat([`${key}=${encodeURIComponent(query[key])}`]),
        []
      )
      .join('&')

    return `${baseUrl}?${queryString}`
  }

  async function paginated({
    url,
    query,
    method,
    headers,
    shouldStop,
    pagination
  }) {
    pagination = Object.assign(
      {
        limit: 100,
        limitParam: 'limit',
        offsetParam: 'offset'
      },
      pagination
    )

    let items = []
    let stop = false
    let status

    logger.debug(`paginated ${method} ${url}`)
    while (!stop) {
      let pageUrl = buildPageUrl(url, items.length, query, pagination)
      let { body: pageItems, status: pageStatus } = await single(
        pageUrl,
        method,
        headers
      )

      if (!status) {
        status = pageStatus
      }

      items.push(...pageItems)

      if (pageItems.length < pagination.limit) {
        stop = true
      } else if (shouldStop) {
        stop = shouldStop(pageItems)
      }
    }

    return { body: items, status }
  }

  return { single, paginated }
}
