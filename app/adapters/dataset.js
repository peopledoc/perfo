import ApplicationAdapter from './application'

export default ApplicationAdapter.extend({
  urlForQuery(query) {
    if (!('project' in query)) {
      throw new Error(
        'urlForQuery called on adapter:dataset without a `project` query parameter'
      )
    }
    if (!('branch' in query)) {
      throw new Error(
        'urlForQuery called on adapter:dataset without a `branch` query parameter'
      )
    }
    if (!('customGraph' in query)) {
      throw new Error(
        'urlForQuery called on adapter:dataset without a `customGraph` query parameter'
      )
    }

    let { project, branch, customGraph } = query
    delete query.project
    delete query.branch
    delete query.customGraph

    let graphURL = this.store
      .adapterFor('custom-graph')
      ._urlForProjectGraph(project, customGraph)
    return `${graphURL}/${encodeURIComponent(branch)}`
  }
})
