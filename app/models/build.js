import Model, { attr } from '@ember-data/model'

export default Model.extend({
  job: attr(),
  start: attr('date'),
  duration: attr(),
  subject: attr(),
  revision: attr()
})
