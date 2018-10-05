import DS from 'ember-data'

const { Model, attr } = DS

export default Model.extend({
  /* eslint-disable camelcase */
  vcs_url: attr('string'),
  build_url: attr('string'),
  vcs_revision: attr('string'),
  committer_name: attr('string'),
  committer_email: attr('string'),
  queued_at: attr('string'),
  start_time: attr('string'),
  stop_time: attr('string'),
  build_time_millis: attr('number'),
  /* eslint-enable camelcase */
  branch: attr('string'),
  subject: attr('string'),
  lifecycle: attr('string'),
  outcome: attr('string')
})
