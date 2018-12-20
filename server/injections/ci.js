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
    options = Object.assign(
      {
        postProcess: (name, data) => data
      },
      options
    )

    return Promise.all(
      providerNames.map(async(name) =>
        options.postProcess(name, await queryProvider(name, query))
      )
    )
  }

  return {
    providers() {
      return queryProviders((provider) => provider.info(), {
        postProcess(name, data) {
          return Object.assign(data, { id: name })
        }
      })
    },

    async projects() {
      let projectLists = await queryProviders(
        (provider) => provider.projects(),
        {
          postProcess(name, data) {
            data.forEach((project) => {
              project.id = `${name}:${project.id}`
              project.provider = name
            })
            return data
          }
        }
      )

      return [].concat(...projectLists)
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
          provider.customGraphData(
            projectId.join(':'),
            branch,
            customGraph.jobName,
            new RegExp(customGraph.artifactMatches)
          )
        )
      }
    }
  }
}
