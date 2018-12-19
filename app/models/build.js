import DS from 'ember-data'

const { Model, attr } = DS

export default Model.extend({
  job: attr(),
  start: attr('date'),
  duration: attr(),
  subject: attr(),
  revision: attr()
})
