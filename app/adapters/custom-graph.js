import ApplicationAdapter from './application'

export default ApplicationAdapter.extend({
  _urlForProjectGraphs(project) {
    return `/projects/${project}/graphs`
  },

  _urlForProjectGraph(project, id) {
    return `${this._urlForProjectGraphs(project)}/${id}`
  },

  urlForQuery(query) {
    if (!('project' in query)) {
      throw new Error(
        'urlForQuery called on adapter:custom-graph without a `project` query parameter'
      )
    }

    let { project } = query
    delete query.project
    return this._urlForProjectGraphs(project)
  },

  urlForCreateRecord(modelName, snapshot) {
    if (!('project' in snapshot.record)) {
      throw new Error(
        'urlForCreateRecord called on adapter:custom-graph without a `project` in the snapshot record'
      )
    }

    return this._urlForProjectGraphs(snapshot.record.project)
  },

  urlForDeleteRecord(id, modelName, snapshot) {
    if (!('project' in snapshot.record)) {
      throw new Error(
        'urlForDeleteRecord called on adapter:custom-graph without a `project` in the snapshot record'
      )
    }

    return this._urlForProjectGraph(snapshot.record.project, id)
  },

  urlForUdpdateRecord(id, modelName, snapshot) {
    if (!('project' in snapshot.record)) {
      throw new Error(
        'urlForUdpdateRecord called on adapter:custom-graph without a `project` in the snapshot record'
      )
    }

    return this._urlForProjectGraph(snapshot.record.project, id)
  }
})
