/* eslintrc-env node */
'use strict'

const providerFactories = require('../providers')
const providerNames = Object.keys(providerFactories)

module.exports = function(injections) {
  let providers = providerNames.reduce((providers, name) => {
    providers[name] = providerFactories[name](injections)
    return providers
  }, {})

  async function queryProvider(name, query, prefixIDs = true) {
    let result = await query(providers[name])

    if (prefixIDs) {
      result = result.map((item) =>
        Object.assign(item, { id: `${name}:${item.id}` })
      )
    }

    return result
  }

  async function queryProviders(query, expectItemArrays = true) {
    let results = await Promise.all(
      providerNames.map((name) => queryProvider(name, query, expectItemArrays))
    )

    if (expectItemArrays) {
      return [].concat(...results)
    } else {
      return providerNames.reduce(
        (data, name, index) =>
          data.concat([Object.assign(results[index], { id: name })]),
        []
      )
    }
  }

  return {
    providers() {
      return queryProviders((provider) => provider.info(), false)
    },

    projects() {
      return queryProviders((provider) => provider.projects())
    },

    builds(project, branch) {
      let [providerName, ...projectId] = project.split(':')

      if (providerName in providers) {
        return providers[providerName].builds(projectId.join(':'), branch)
      }
    },

    customGraphData(project, branch, customGraph) {
      let [providerName, ...projectId] = project.split(':')

      if (providerName in providers) {
        return providers[providerName].customGraphData(
          projectId.join(':'),
          branch,
          customGraph
        )
      }
    }
  }
}
