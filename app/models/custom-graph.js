import DS from 'ember-data'
const { Model, attr } = DS

export default Model.extend({
  project: attr(),
  title: attr(),
  jobName: attr(),
  artifactMatches: attr(),
  branchMatches: attr(),
  order: attr(),
  showLegend: attr('boolean'),
  formatter: attr()
})
