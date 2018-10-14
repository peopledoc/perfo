import CircleCISerializer from 'perfo/serializers/circleci'

export default CircleCISerializer.extend({
  _generateItemID(model, project) {
    project.id = [project.vcs_type, project.username, project.reponame].join(
      ':'
    )
  }
})
