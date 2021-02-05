import Model, { attr } from '@ember-data/model'

export default Model.extend({
  project: attr(),
  title: attr(),
  jobName: attr(),
  artifactMatches: attr(),
  branchMatches: attr(),
  order: attr(),
  showLegend: attr('boolean'),
  graphType: attr(),
  formatter: attr()
})
