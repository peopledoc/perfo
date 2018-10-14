import CircleCIAdapter from 'perfo/adapters/circleci'

export default CircleCIAdapter.extend({
  urlForQuery(query) {
    if (!('project' in query)) {
      throw new Error(
        'urlForQuery called on adapter:circleci-build without a `project` query parameter'
      )
    }

    let projectPath = query.project.replace(/:/g, '/')
    let branchPath = ''
    delete query.project

    if ('branch' in query) {
      branchPath = `/tree/${query.branch}`
      delete query.branch
    }

    return `${this.buildURL()}/project/${projectPath}${branchPath}`
  }
})
