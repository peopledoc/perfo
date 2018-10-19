import CircleCISerializer from 'perfo/serializers/circleci'

export default CircleCISerializer.extend({
  _generateItemID(model, project) {
    project.id = [project.vcs_type, project.username, project.reponame].join(
      ':'
    )
  },

  _flattenBranches(project) {
    project.branches = Object.keys(project.branches)
      .filter((b) => b !== 'master')
      .map(decodeURIComponent)
      .sort()
    project.branches.unshift('master')
  },

  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    if (['query', 'findAll'].indexOf(requestType) !== -1) {
      for (let item of payload) {
        this._flattenBranches(item)
      }
    }

    return this._super(store, primaryModelClass, payload, id, requestType)
  }
})
