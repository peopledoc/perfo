/* eslint-env node */
'use strict'

const request = require('request')

module.exports = function() {
  function single(url, method, headers) {
    return new Promise((resolve, reject) => {
      let jar = request.jar()
      request(
        {
          url,
          method,
          headers,
          jar
        },
        (error, response, body) => {
          if (error) {
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

            resolve({
              body: parsed,
              status: response.statusCode
            })
          }
        }
      )
    })
  }

  async function paginated(url, method, headers, shouldStop) {
    let items = []
    let stop = false
    let limit = 100
    let status

    while (!stop) {
      let pageUrl = `${url}?limit=${limit}&offset=${items.length}`
      let { body: pageItems, status: pageStatus } = await single(
        pageUrl,
        method,
        headers
      )

      if (!status) {
        status = pageStatus
      }

      items.push(...pageItems)

      if (pageItems.length < limit) {
        stop = true
      } else if (shouldStop) {
        stop = shouldStop(pageItems)
      }
    }

    return { body: items, status }
  }

  return { single, paginated }
}
