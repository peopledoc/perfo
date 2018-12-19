import { computed } from '@ember/object'
import LineGraph from 'perfo/components/line-graph'
import { millisecondsFormatter } from 'perfo/utils/formatters'

export default LineGraph.extend({
  projectBuilds: computed(() => []),

  valueTitle: 'Duration',
  valueFormatter: millisecondsFormatter,

  // Graph data for highcharts
  chartData: computed('projectHasWorkflows', 'projectBuilds.@each', function() {
    let jobs = [...new Set(this.projectBuilds.map((build) => build.job))]

    return jobs.map((j) => {
      let jobBuilds = this.projectBuilds.filter((build) => build.job === j)

      return {
        name: j,
        data: jobBuilds.map((build) => {
          return {
            x: build.start,
            y: build.duration,
            name: `${build.subject}<br><i>${build.revision}</i>`
          }
        })
      }
    })
  })
})
