/* eslint-env node */
'use strict'

const { join } = require('path')

module.exports = function(injections) {
  let {
    config: { cacheValidity, cachePruneInterval },
    logger,
    store
  } = injections

  let nextPrune = 0
  async function maybePruneCache() {
    let now = Date.now()

    if (nextPrune > now) {
      return
    }

    let keys = await store.keys('cache')
    for (let key of keys) {
      let data = await store.getItem(key)
      if (data && data.validUntil < now) {
        await store.delItem(key)
      }
    }

    nextPrune = now + cachePruneInterval
  }

  return async function(key, getter) {
    await maybePruneCache()

    let now = Date.now()
    let storeKey = join('cache', key)

    try {
      let data = await store.getItem(storeKey)
      if (!data) {
        throw new Error('cache miss')
      }

      if (data.validUntil < now) {
        await store.delItem(storeKey)
        throw new Error('cache miss')
      } else {
        return data.payload
      }
    } catch(e) {
      if (e.message !== 'cache miss') {
        logger.error('cache get', e)
        throw e
      }

      logger.debug(`cache miss: ${key}`)
      let payload = await getter()
      if (!payload.__nocache) {
        await store.setItem(storeKey, {
          validUntil: now + cacheValidity,
          payload
        })
      }

      return payload
    }
  }
}

module.exports.hasScope = true
