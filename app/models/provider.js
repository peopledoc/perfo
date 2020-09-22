import Model, { attr } from '@ember-data/model'

export default Model.extend({
  connected: attr(),
  account: attr(),
  icon: attr(),
  name: attr()
})
