import Service from '@ember/service'
import { computed } from '@ember/object'

export default Service.extend({
  customGraphs: computed(() => [
    {
      project: 'github:peopledoc:employee-app-front',
      title: 'Top 20 build size contributors',
      jobName: 'bundle_size',
      artifactMatches: 'build-stats/top20.json',
      branchMatches: '',
      order: 0
    }
  ])
})
