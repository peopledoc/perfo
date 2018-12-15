/* eslint-env node */
'use strict'

const keepKeys = {
  artifact: ['path', 'url'],
  build: [
    'build_num',
    'start_time',
    'build_time_millis',
    'branch',
    'vcs_revision',
    'subject',
    'lifecycle',
    'outcome',
    'workflows',
    'has_artifacts',
    'vcs_type',
    'username',
    'reponame'
  ],
  project: [
    'vcs_url',
    'vcs_type',
    'followed',
    'username',
    'reponame',
    'branches'
  ]
}

function prune(model, item) {
  let pruned = {}
  for (let key of keepKeys[model]) {
    pruned[key] = item[key]
  }
  return pruned
}

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
        return `users-${circleToken}/info`
      }
    },

    // User projects
    {
      match: '/projects',
      cacheKey() {
        return `users-${circleToken}/projects`
      },
      postProcessor() {
        // Filter projects by organization
        return (data) =>
          (orgFilter
            ? data.filter((project) => project.username === orgFilter)
            : data
          ).map((project) => prune('project', project))
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
        return `${type}.${org}.${project}/artifacts-${buildNum}`
      },
      postProcessor() {
        return (data) => data.map((artifact) => prune('artifact', artifact))
      }
    },

    // Project builds
    {
      // /project/github/myorg/myproject/tree/mybranch
      match: /^\/project\//,
      cacheKey(path) {
        let { type, org, project, branch } = splitBuildsUrl(path)
        return `${type}.${org}.${project}/builds-${branch}`
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
        return async function(data) {
          let storeKey = `project-builds/${type}-${org}-${project}-${branch}`
          let projectBuilds = await store.getItem(storeKey)

          if (!projectBuilds) {
            projectBuilds = data
          } else {
            let existingBuildNums = projectBuilds.map(
              (build) => build.build_num
            )

            // Store new builds
            projectBuilds.push(
              data.filter(
                (build) => existingBuildNums.indexOf(build.build_num) === -1
              )
            )
          }

          // Exclude builds that are too old and prune them
          let minDate = Date.now() - maxBuildAge
          projectBuilds = projectBuilds
            .filter((build) => new Date(build.start_time).getTime() > minDate)
            .map((build) => prune('build', build))

          await store.setItem(storeKey, projectBuilds)
          return projectBuilds
        }
      }
    }
  ]
}
