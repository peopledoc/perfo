/* eslint-env node */
'use strict'

const {
  mkdir: mkdirAsync,
  mkdirSync,
  readdirSync,
  readFile: readFileAsync,
  readFileSync,
  unlink: unlinkAsync,
  unlinkSync,
  writeFile: writeFileAsync
} = require('fs')
const { dirname, join } = require('path')

const [mkdir, readFile, unlink, writeFile] = [
  mkdirAsync,
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
  function pruneDir(dir) {
    let hasContent = false
    for (let dirent of readdirSync(dir, { withFileTypes: true })) {
      let path = join(dir, dirent.name)
      if (dirent.isDirectory()) {
        if (!pruneDir(path)) {
          unlinkSync(path)
        } else {
          hasContent = true
        }
      } else {
        if (JSON.parse(readFileSync(path)).validUntil < now) {
          unlinkSync(path)
        } else {
          hasContent = true
        }
      }
    }
    return hasContent
  }
  pruneDir(directory, now)

  return async function(key, getter) {
    let now = Date.now()
    let path = join(directory, key)

    try {
      await mkdir(dirname(path), { recursive: true })
    } catch(e) {
      if (e.code !== 'EEXIST') {
        throw e
      }
    }

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
            validUntil: now + validity,
            payload
          })
        )
      }
      return payload
    }
  }
}
