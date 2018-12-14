/* eslint-env node */
'use strict'

const {
  mkdir: mkdirAsync,
  readdir: readdirAsync,
  readFile: readFileAsync,
  rmdir: rmdirAsync,
  unlink: unlinkAsync,
  writeFile: writeFileAsync
} = require('fs')
const { dirname, join } = require('path')

const [mkdir, readdir, readFile, rmdir, unlink, writeFile] = [
  mkdirAsync,
  readdirAsync,
  readFileAsync,
  rmdirAsync,
  unlinkAsync,
  writeFileAsync
].map(require('util').promisify)

module.exports = function(injections) {
  let {
    config: { dataDir },
    logger
  } = injections

  function pathFor(key) {
    return `${join(dataDir, key)}.json`
  }

  async function ensureDir(dir) {
    try {
      await mkdir(dir, { recursive: true })
    } catch(e) {
      if (e.code !== 'EEXIST') {
        logger.error(`store.ensureDir ${dir}`, e)
        throw e
      }
    }
  }

  async function delItem(key) {
    let path = pathFor(key)

    try {
      await unlink(path)
    } catch(e) {
      if (e.code !== 'ENOENT') {
        logger.error(`store.delItem ${key} unlink ${path}`, e)
        throw e
      }
    }

    let currentPath = path
    while (currentPath.startsWith(dataDir) && currentPath !== dataDir) {
      currentPath = dirname(currentPath)

      let siblings
      try {
        siblings = await readdir(currentPath)
      } catch(e) {
        logger.error(`store.delItem ${key} readdir ${currentPath}`, e)
        throw e
      }

      if (siblings.length === 0) {
        try {
          await rmdir(currentPath)
        } catch(e) {
          logger.error(`store.delItem ${key} rmdir ${currentPath}`, e)
          throw e
        }
      }
    }
  }

  async function keys(prefix) {
    let currentPath = prefix ? join(dataDir, prefix) : dataDir
    let foundKeys = []
    let content

    try {
      content = await readdir(currentPath, { withFileTypes: true })
    } catch(e) {
      if (e.code !== 'ENOENT') {
        logger.error(`store.keys ${prefix} readdir ${currentPath}`, e)
        throw e
      }
      content = []
    }

    for (let dirent of content) {
      let key = prefix ? join(prefix, dirent.name) : dirent.name
      if (dirent.isDirectory()) {
        let subkeys = await keys(key)
        foundKeys.push(...subkeys)
      } else {
        foundKeys.push(key)
      }
    }
    return foundKeys
  }

  async function getItem(key) {
    let path = pathFor(key)
    try {
      let content = await readFile(path)
      return JSON.parse(content)
    } catch(e) {
      if (e.code !== 'ENOENT') {
        logger.error(`store.getItem ${key} readFile ${path}`, e)
        throw e
      }
      return undefined
    }
  }

  async function setItem(key, value) {
    let path = pathFor(key)

    try {
      await ensureDir(dirname(path))
    } catch(e) {
      logger.error(`store.setItem ${key} ensureDir ${dirname(path)}`, e)
      throw e
    }

    try {
      await writeFile(path, JSON.stringify(value))
    } catch(e) {
      logger.error(`store.setItem ${key} writeFile ${path}`, e)
      throw e
    }
  }

  return {
    getItem,
    setItem,
    delItem,
    keys
  }
}
