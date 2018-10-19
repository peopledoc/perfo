import DS from 'ember-data'

const { Model, attr } = DS

export default Model.extend({
  path: attr(),
  url: attr()
})
