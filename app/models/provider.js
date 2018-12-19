import DS from 'ember-data'

const { Model, attr } = DS

export default Model.extend({
  connected: attr(),
  account: attr(),
  icon: attr(),
  name: attr()
})
