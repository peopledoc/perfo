import Controller from '@ember/controller'
import { computed } from '@ember/object'
import { readOnly } from '@ember/object/computed'
import { inject as service } from '@ember/service'
import moment from 'moment'

export default Controller.extend({
  circleci: service(),

  // CircleCI auth
  isCircleCIReady: readOnly('circleci.userData.isSettled'),
  userName: readOnly('circleci.userData.name'),

  // Projects, selected project and branch
  projects: computed('isCircleCIReady', function() {
    return this.isCircleCIReady ? this.store.findAll('circleci-project') : []
  }),
  selectedProject: null,
  selectedBranch: 'master',

  // Builds for selected project on selected branch
  projectBuilds: computed('selectedProject', 'selectedBranch', function() {
    return this.selectedProject
      ? this.store.query('circleci-build', {
        project: this.selectedProject.id,
        branch: this.selectedBranch,
        limit: 100
      })
      : []
  }),

  // True when workflows are active for any build
  projectHasWorkflows: computed('projectBuilds.@each', function() {
    return this.projectBuilds.any((build) => !!build.workflows)
  }),

  // Successful projects sorted by start time ; when workflows are active,
  // contains only builds with workflows
  validBuilds: computed(
    'projectBuilds.@each',
    'projectHasWorkflows',
    function() {
      let filtered = this.projectBuilds
        .filterBy('lifecycle', 'finished')
        .filterBy('outcome', 'success')

      if (this.projectHasWorkflows) {
        filtered = filtered.filter((build) => !!build.workflows)
      }

      return filtered.sortBy('start_time')
    }
  ),

  // Graph options for highcharts
  chartOptions: computed('selectedProject', 'selectedBranch', function() {
    return {
      title: {
        text: `Build durations for ${this.selectedProject.displayName} (on ${
          this.selectedBranch
        })`
      },
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y}ms</b><br/>'
      },
      xAxis: { type: 'datetime', title: { text: 'Date' } },
      yAxis: {
        labels: {
          formatter: (data) => moment.utc(data.value).format('mm:ss')
        },
        title: { text: 'Duration (minutes)' }
      }
    }
  }),

  // Graph data for highcharts
  chartData: computed('projectHasWorkflows', 'validBuilds.@each', function() {
    let jobs = this.projectHasWorkflows
      ? [...new Set(this.validBuilds.map((build) => build.workflows.job_name))]
      : ['Total build duration']

    return jobs.map((j) => {
      let jobBuilds = this.projectHasWorkflows
        ? this.validBuilds.filter((build) => build.workflows.job_name === j)
        : this.validBuilds

      return {
        type: 'line',
        name: j,
        dataLabels: {
          formatter: (value) => moment.utc(value).format('mm:ss')
        },
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
