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
            resolve({
              body: JSON.parse(body),
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
    let limit = 30
    let status

    while (!stop) {
      let pageUrl = `${url}?limit=${limit}&offset=${items.length}`
      console.log(`paginated: ${pageUrl}`)
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
