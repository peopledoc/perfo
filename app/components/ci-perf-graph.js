import { computed } from '@ember/object'
import moment from 'moment'
import LineGraph from 'perfo/components/line-graph'

export default LineGraph.extend({
  projectHasWorkflows: null,
  projectBuilds: computed(() => []),

  valueTitle: 'Duration',
  valueFormatter: (value) => moment.utc(value).format('mm:ss'),

  // Graph data for highcharts
  chartData: computed('projectHasWorkflows', 'projectBuilds.@each', function() {
    let jobs = this.projectHasWorkflows
      ? [
        ...new Set(
          this.projectBuilds.map((build) => build.workflows.job_name)
        )
      ]
      : ['Total build duration']

    return jobs.map((j) => {
      let jobBuilds = this.projectHasWorkflows
        ? this.projectBuilds.filter((build) => build.workflows.job_name === j)
        : this.projectBuilds

      return {
        name: j,
        data: jobBuilds.map((build) => {
          return {
            x: build.start_time,
            y: build.build_time_millis,
            name: `${build.subject}<br><i>${build.vcs_revision}</i>`
          }
        })
      }
    })
  })
})
