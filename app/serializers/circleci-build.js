import CircleCISerializer from 'perfo/serializers/circleci'

export default CircleCISerializer.extend({
  _generateItemID(model, build) {
    build.id = [
      build.vcs_type,
      build.username,
      build.reponame,
      build.build_num
    ].join(':')
  }
})
