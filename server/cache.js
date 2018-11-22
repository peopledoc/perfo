/* eslint-env node */
'use strict'

const { createHash } = require('crypto')
const {
  mkdirSync,
  readdirSync,
  readFile: readFileAsync,
  readFileSync,
  unlink: unlinkAsync,
  unlinkSync,
  writeFile: writeFileAsync
} = require('fs')
const { join } = require('path')

const [readFile, unlink, writeFile] = [
  readFileAsync,
  unlinkAsync,
  writeFileAsync
].map(require('util').promisify)

module.exports = function createCache(directory, validity) {
  // Create directory
  try {
    mkdirSync(directory, { recursive: true })
  } catch(e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
  }

  // Prune expired cache
  let now = Date.now()
  for (let key of readdirSync(directory)) {
    let path = join(directory, key)
    if (JSON.parse(readFileSync(path)).validUntil < now) {
      unlinkSync(path)
    }
  }

  return async function(rawKey, getter) {
    let now = Date.now()
    let hash = createHash('sha256')
    hash.update(rawKey)
    let path = join(directory, hash.digest('hex'))

    try {
      let json = await readFile(path)
      let data = JSON.parse(json)
      if (data.validUntil < now) {
        await unlink(path)
        throw new Error('expired')
      } else {
        return data.payload
      }
    } catch(e) {
      if (e.code !== 'ENOENT' && e.message !== 'expired') {
        throw e
      }

      let payload = await getter()
      if (!payload.__nocache) {
        await writeFile(
          path,
          JSON.stringify({
            rawKey,
            validUntil: now + validity,
            payload
          })
        )
      }
      return payload
    }
  }
}
