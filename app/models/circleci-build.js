import DS from 'ember-data'
const { Model, attr } = DS

export default Model.extend({
  /* eslint-disable camelcase */
  build_num: attr(),
  start_time: attr('date'),
  build_time_millis: attr(),
  branch: attr(),
  vcs_revision: attr(),
  subject: attr(),
  lifecycle: attr(),
  outcome: attr(),
  workflows: attr(),
  has_artifacts: attr()
  /* eslint-enable camelcase */
})
