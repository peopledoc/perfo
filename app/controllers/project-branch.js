import Controller from '@ember/controller'
import { computed } from '@ember/object'
import { alias, readOnly, not } from '@ember/object/computed'
import { inject as service } from '@ember/service'

export default Controller.extend({
  navigation: service(),

  project: readOnly('navigation.selectedProject'),
  branch: readOnly('navigation.selectedBranch'),
  customGraphs: alias('model'),

  mainGraphTitle: computed('project.displayName', 'branch', function() {
    return `Build durations for ${this.project.displayName} (on ${this.branch})`
  }),

  // Builds for selected project on selected branch
  isLoadingBuilds: not('projectBuilds.isSettled'),
  projectBuilds: computed('project', 'branch', function() {
    return this.project
      ? this.store.query('circleci-build', {
        project: this.project.id,
        branch: this.branch,
        limit: 100
      })
      : Promise.resolve([])
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

  actions: {
    addCustomGraph() {}
  }
})
