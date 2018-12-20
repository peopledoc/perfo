import ApplicationAdapter from './application'

export default ApplicationAdapter.extend({
  urlForQuery(query) {
    if (!('project' in query)) {
      throw new Error(
        'urlForQuery called on adapter:build without a `project` query parameter'
      )
    }
    if (!('branch' in query)) {
      throw new Error(
        'urlForQuery called on adapter:build without a `branch` query parameter'
      )
    }

    let { project, branch } = query
    delete query.project
    delete query.branch

    let projectURL = this.store
      .adapterFor('project')
      .urlForFindRecord(project, 'project')
    return `${projectURL}/builds/${branch}`
  }
})
