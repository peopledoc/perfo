import DS from 'ember-data'

const { Model, attr } = DS

export default Model.extend({
  date: attr('date'),
  subject: attr(),
  revision: attr(),
  points: attr()
})
