import CircleCISerializer from 'perfo/serializers/circleci'

export default CircleCISerializer.extend({
  _generateItemID(model, artifact) {
    artifact.id = artifact.url
  }
})
