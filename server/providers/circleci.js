/* eslint-env node */
'use strict'

const CIRCLE_API = 'https://circleci.com/api/v1.1'
const CIRCLECI_ICON
  = 'https://d3r49iyjzglexf.cloudfront.net/favicon-066b37ff00f0f968b903c13ae88b5573b62665aea8fbe91bb61c55dfa9446523.ico'

module.exports = function(injections) {
  let {
    config: { circleToken, orgFilter, maxBuildAge },
    request: { single, paginated },
    logger,
    cache,
    store
  } = injections

  async function circleRequest(cacheKey, url, requestor = single) {
    let targetUrl = `${CIRCLE_API}${url}`
    let auth = Buffer.from(`${circleToken}:`).toString('base64')
    let headers = {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json'
    }

    return await cache(`circleci/${cacheKey}`, function() {
      return requestor(targetUrl, 'GET', headers)
    })
  }

  async function circleProjectBuilds(project, branch) {
    let storeKey = `circleci/${project}-${branch}`
    let minDate = new Date(Date.now() - maxBuildAge).toISOString()
    let url = `/project/${project.replace(/:/g, '/')}/tree/${branch}`
    let response

    let projectBuilds = (await store.getItem(storeKey)) || []
    let existingBuilds = projectBuilds.map((build) => build.id)

    try {
      response = await circleRequest(
        `${project.replace(/:/g, '.')}/builds-${branch}`,
        url,
        async function(url, method, headers) {
          // Fetch all pages until we find either a build we already have,
          // or a build that is too old
          return paginated({
            url,
            method,
            headers,
            query: { filter: 'successful' },
            shouldStop: (pageItems) =>
              pageItems.some(
                (build) =>
                  existingBuilds.indexOf(build.build_num) !== -1
                  || build.start_time < minDate
              )
          })
        }
      )
    } catch(e) {
      logger.error('circleci circleProjectBuilds circleRequest', e)
      return []
    }

    if (response.status >= 400) {
      logger.error(
        'circleci circleProjectBuilds',
        `${url} returned ${response.status}`
      )
      return []
    }

    // Only keep builds with workflows when workflows are enabled
    let circleCIBuilds = response.body
    let hasWorkflows = circleCIBuilds.some((build) => !!build.workflows)
    if (hasWorkflows) {
      circleCIBuilds = circleCIBuilds.filter((build) => !!build.workflows)
    }

    // Map returned builds to the standard format
    circleCIBuilds = circleCIBuilds.map((build) => {
      return {
        id: build.build_num,
        job: hasWorkflows ? build.workflows.job_name : 'build',
        start: build.start_time,
        duration: build.build_time_millis,
        subject: build.subject,
        revision: build.vcs_revision,
        hasArtifacts: build.has_artifacts
      }
    })

    if (!projectBuilds) {
      projectBuilds = circleCIBuilds
    } else {
      // Add new builds
      projectBuilds.push(
        ...circleCIBuilds.filter(
          (build) => existingBuilds.indexOf(build.id) === -1
        )
      )
    }

    // Exclude builds that are too old and save the rest
    projectBuilds = projectBuilds
      .filter((build) => build.start >= minDate)
      .sort((a, b) => {
        if (a.start < b.start) {
          return -1
        } else if (a.start > b.start) {
          return 1
        } else {
          return 0
        }
      })

    await store.setItem(storeKey, projectBuilds)
    return projectBuilds
  }

  async function circleBuildArtifacts(project, build) {
    // Fetch build artifact list from the store
    let storeKey = `circleci/${project}-artifacts/${build.id}`
    let artifacts = await store.getItem(storeKey)

    if (!artifacts) {
      // Artifacts unknown, fetch them from circleci
      let url = `/project/${project.replace(/:/g, '/')}/${build.id}/artifacts`
      let response = await circleRequest(
        `artifacts/${project}/${build.id}`,
        url
      )

      if (response.status >= 400) {
        logger.error(
          'circleci circleBuildArtifacts',
          `${url} returned ${response.status}`
        )
        return null
      }

      artifacts = response.body.map((artifact) => {
        return { path: artifact.path, url: artifact.url }
      })
      await store.setItem(storeKey, artifacts)
    }

    return artifacts
  }

  async function circleDownload(url) {
    let storeKey = `circleci/downloads/${url
      .replace('https://', '')
      .replace(/\//g, '_')}`

    let data = await store.getItem(storeKey)
    if (!data) {
      let response = await single(
        `${url}?circle-token=${circleToken}`,
        'GET',
        {}
      )

      if (response.status >= 400) {
        logger.error('circleci download', `${url} returned ${response.status}`)
        return null
      }

      data = response.body
      await store.setItem(storeKey, data)
    }

    return data
  }

  return {
    async info() {
      let response, connected, user

      try {
        response = await circleRequest('info', '/me')
        connected = true
      } catch(e) {
        logger.error('circleci info', e)
        connected = false
      }

      if (response.status >= 400) {
        logger.error('circleci info', `status ${response.status}`)
        connected = false
      } else {
        user = response.body
      }

      return {
        account: user.name,
        connected,
        icon: CIRCLECI_ICON,
        name: 'CircleCI'
      }
    },

    async projects() {
      let response

      try {
        response = await circleRequest('projects', '/projects')
      } catch(e) {
        logger.error('circleci projects circleRequest', e)
        return []
      }

      if (response.status >= 400) {
        logger.error(
          'circleci projects',
          `/projects returned ${response.status}`
        )
        return []
      }

      return response.body
        .filter(
          (project) => (orgFilter ? project.username === orgFilter : true)
        )
        .map((project) => {
          return {
            id: `${project.vcs_type}:${project.username}:${project.reponame}`,
            name: `${project.reponame}`,
            branches: Object.keys(project.branches)
          }
        })
    },

    builds(project, branch) {
      return circleProjectBuilds(project, branch)
    },

    async customGraphData(project, branch, customGraph) {
      let artifactRegex = new RegExp(customGraph.artifactMatches)

      let builds = (await circleProjectBuilds(project, branch)).filter(
        (build) => build.hasArtifacts
      )

      let data = await Promise.all(
        builds.map(async(build) => {
          let artifacts = await circleBuildArtifacts(project, build)
          let [artifactUrl] = artifacts
            .filter((artifact) => artifactRegex.test(artifact.path))
            .map((artifact) => artifact.url)
          let artifactData

          if (artifactUrl) {
            artifactData = await circleDownload(artifactUrl)
          }

          if (artifactData) {
            return {
              date: build.start,
              subject: build.subject,
              revision: build.revision,
              points: artifactData
            }
          }

          return null
        })
      )

      return data.filter((item) => !!item)
    }
  }
}
