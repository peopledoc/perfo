/* eslint-env node */
'use strict'

const {
  mkdir: mkdirAsync,
  readFile: readFileAsync,
  writeFile: writeFileAsync
} = require('fs')
const { dirname, join } = require('path')

const [mkdir, readFile, writeFile] = [
  mkdirAsync,
  readFileAsync,
  writeFileAsync
].map(require('util').promisify)

module.exports = function(injections) {
  let {
    config: { dataDir }
  } = injections

  function pathFor(key) {
    return `${join(dataDir, key)}.json`
  }

  async function ensureDir(dir) {
    try {
      await mkdir(dir, { recursive: true })
    } catch(e) {
      if (e.code !== 'EEXIST') {
        throw e
      }
    }
  }

  async function getItem(key) {
    let path = pathFor(key)

    try {
      return JSON.parse(await readFile(path))
    } catch(e) {
      if (e.code === 'ENOENT') {
        return undefined
      }

      throw e
    }
  }

  async function setItem(key, value) {
    let path = pathFor(key)
    await ensureDir(dirname(key))
    await writeFile(path, JSON.stringify(value))
  }

  return {
    getItem,
    setItem
  }
}
