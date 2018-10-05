import CircleCISerializer from 'perfo/serializers/circleci'

export default CircleCISerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    if (requestType === 'findAll') {
      for (let project of payload) {
        project.id = [
          project.vcs_type,
          project.username,
          project.reponame
        ].join(':')
      }
    }

    return this._super(store, primaryModelClass, payload, id, requestType)
  }
})
