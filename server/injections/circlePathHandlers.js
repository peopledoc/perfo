/* eslint-env node */
'use strict'

module.exports = function(injections) {
  let {
    config: { circleToken, orgFilter, maxBuildAge },
    store,
    request: { paginated }
  } = injections

  function splitBuildsUrl(path) {
    // /project/github/myorg/myproject/tree/mybranch
    let [, , type, org, project, , branch] = path.split('/')
    return { type, org, project, branch }
  }

  return [
    // User info
    {
      match: '/me',
      cacheKey() {
        return `users/${circleToken}/me`
      }
    },

    // User projects
    {
      match: '/projects',
      cacheKey() {
        return `users/${circleToken}/projects`
      },
      postProcessor() {
        // Filter projects by organization
        return (data) =>
          orgFilter
            ? data.filter((project) => project.username === orgFilter)
            : data
      }
    },

    // Artifact download
    {
      match: /^\/download/,
      cacheKey(path, query) {
        // https://3529-99822495-gh.circle-artifacts.com/0/home/circleci/employee-app-front/build-stats/top20.json'
        return `downloads/${query.url
          .replace('https://', '')
          .replace(/\//g, '_')}`
      },
      targetUrl(path, query) {
        if (!query.url) {
          throw new Error('Missing url query param for download')
        }

        return `${query.url}?circle-token=${circleToken}`
      }
    },

    // Build artifacts
    {
      // /project/github/myorg/myproject/build/artifacts
      match: /^\/project\/.*\/artifacts$/,
      cacheKey(path) {
        let [, , type, org, project, buildNum] = path.split('/')
        return `projects/${type}.${org}.${project}/build-${buildNum}/artifacts`
      }
    },

    // Project builds
    {
      // /project/github/myorg/myproject/tree/mybranch
      match: /^\/project\//,
      cacheKey(path) {
        let { type, org, project, branch } = splitBuildsUrl(path)
        return `projects/${type}.${org}.${project}/builds-${branch}`
      },
      requestor(path) {
        let { type, org, project, branch } = splitBuildsUrl(path)
        let storeKey = `project-builds/${type}-${org}-${project}-${branch}`
        let minDate = Date.now() - maxBuildAge

        return async function(url, method, headers) {
          let projectBuilds = (await store.getItem(storeKey)) || []
          let existingBuildNums = projectBuilds.map((build) => build.build_num)

          // Fetch all pages until we find either a build we already have,
          // or a build that is too old
          return paginated(url, method, headers, (pageItems) =>
            pageItems.some(
              (build) =>
                existingBuildNums.indexOf(build.build_num) !== -1
                || new Date(build.start_time).getTime() < minDate
            )
          )
        }
      },
      postProcessor(path) {
        let { type, org, project, branch } = splitBuildsUrl(path)
        return async function(newBuilds) {
          let storeKey = `project-builds/${type}-${org}-${project}-${branch}`
          let projectBuilds = await store.getItem(storeKey)

          if (!projectBuilds) {
            projectBuilds = newBuilds
          } else {
            let existingBuildNums = projectBuilds.map(
              (build) => build.build_num
            )

            // Store new builds
            projectBuilds.push(
              newBuilds.filter(
                (build) => existingBuildNums.indexOf(build.build_num) === -1
              )
            )
          }

          // Exclude builds that are too old
          let minDate = Date.now() - maxBuildAge
          projectBuilds = projectBuilds.filter(
            (build) => new Date(build.start_time).getTime() > minDate
          )

          await store.setItem(storeKey, projectBuilds)
          return projectBuilds
        }
      }
    }
  ]
}
