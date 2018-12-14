/* eslint-env node */
'use strict'

const { dirname, join } = require('path')

const {
  PERFO_ROOT_URL,
  PERFO_DATA_DIR,
  PERFO_CACHE_VALIDITY,
  PERFO_CACHE_PRUNE_INTERVAL,
  PERFO_ORG_FILTER,
  PERFO_CIRCLECI_TOKEN,
  PERFO_LOG_FORMAT,
  PERFO_MAX_BUILD_AGE
} = process.env

const MINUTE = 60 * 1000
const MONTH = 31 * 24 * 60 * MINUTE

module.exports = function() {
  let dataDir = PERFO_DATA_DIR || join(dirname(dirname(__dirname)), 'data')
  let cacheValidity = Number(PERFO_CACHE_VALIDITY) || 30 * MINUTE
  let cachePruneInterval = Number(PERFO_CACHE_PRUNE_INTERVAL) || cacheValidity
  let logFormat = PERFO_LOG_FORMAT || 'dev'
  let maxBuildAge = Number(PERFO_MAX_BUILD_AGE) || 6 * MONTH

  return {
    rootURL: PERFO_ROOT_URL,
    orgFilter: PERFO_ORG_FILTER,
    circleToken: PERFO_CIRCLECI_TOKEN,
    logFormat,
    dataDir,
    cacheValidity,
    cachePruneInterval,
    maxBuildAge
  }
}
