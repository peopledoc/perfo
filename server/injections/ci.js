/* eslintrc-env node */
'use strict'

const providerFactories = require('../providers')
const providerNames = Object.keys(providerFactories)

module.exports = function(injections) {
  let providers = providerNames.reduce((providers, name) => {
    providers[name] = providerFactories[name](injections)
    return providers
  }, {})

  async function queryProvider(name, query) {
    let result = await query(providers[name])

    return result
  }

  function queryProviders(query, options) {
    options = Object.assign(options, {
      postProcess: (name, data) => data
    })

    return Promise.all(
      providerNames.map(async(name) =>
        options.postProcess(name, await queryProvider(name, query))
      )
    )
  }

  return {
    async providers() {
      let data = await queryProviders((provider) => provider.info(), {
        postProcess(name, data) {
          let ret = {}
          ret[name] = data
          return ret
        }
      })

      return Object.assign({}, ...data)
    },

    async projects() {
      return queryProviders((provider) => provider.projects(), {
        postProcess(name, data) {
          data.forEach((project) => (project.provider = name))
          return data
        }
      })
    },

    builds(project, branch) {
      let [providerName, ...projectId] = project.split(':')

      if (providerName in providers) {
        return queryProvider(providerName, (provider) =>
          provider.builds(projectId.join(':'), branch)
        )
      }
    },

    customGraphData(project, branch, customGraph) {
      let [providerName, ...projectId] = project.split(':')

      if (providerName in providers) {
        return queryProvider(providerName, (provider) =>
          provider.customGraphData(projectId.join(':'), branch, customGraph)
        )
      }
    }
  }
}
