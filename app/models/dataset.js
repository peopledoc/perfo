import Model, { attr } from '@ember-data/model'

export default Model.extend({
  date: attr('date'),
  subject: attr(),
  revision: attr(),
  points: attr()
})
