import Controller from '@ember/controller'
import { computed } from '@ember/object'
import { readOnly, not, notEmpty, sort } from '@ember/object/computed'
import { inject as service } from '@ember/service'

export default Controller.extend({
  navigation: service(),
  store: service(),

  project: readOnly('navigation.selectedProject'),
  branch: readOnly('navigation.selectedBranch'),

  isAddingCustomGraph: notEmpty('newCustomGraph'),
  newCustomGraph: null,
  customGraphs: computed('project', function() {
    return this.store.query('custom-graph', {
      project: this.project.id
    })
  }),
  customGraphSorting: Object.freeze(['order']),
  sortedCustomGraphs: sort('customGraphs', 'customGraphSorting'),

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
    toggleAddCustomGraph() {
      if (this.newCustomGraph) {
        this.set('newCustomGraph', null)
      } else {
        this.set(
          'newCustomGraph',
          this.store.createRecord('custom-graph', {
            project: this.project.id,
            showLegend: true,
            formatter: 'none'
          })
        )
      }
    },

    addCustomGraph() {
      this.store
        .query('custom-graph', {
          project: this.project.id
        })
        .then((graphs) => {
          this.newCustomGraph.set(
            'order',
            Math.max(0, Math.max(...graphs.map((g) => g.order + 1)))
          )
          this.newCustomGraph.save().then(() => {
            this.set('newCustomGraph', null)
            this.notifyPropertyChange('customGraphs')
          })
        })
    },

    deleteCustomGraph(graph) {
      graph
        .destroyRecord()
        .then(() => this.notifyPropertyChange('customGraphs'))
    },

    toggleEditCustomGraph(graph) {
      graph.set('isEditing', !graph.isEditing)
    },

    saveCustomGraph(graph) {
      graph.save().then(() => {
        graph.set('isEditing', false)
        this.notifyPropertyChange('customGraphs')
      })
    }
  }
})
