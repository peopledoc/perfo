import Controller from '@ember/controller'
import { computed } from '@ember/object'
import { readOnly, not, notEmpty, sort } from '@ember/object/computed'
import { inject as service } from '@ember/service'

export default Controller.extend({
  navigation: service(),
  store: service(),

  project: readOnly('navigation.selectedProject'),
  branch: readOnly('navigation.selectedBranch'),

  accordionSelectedItem: 'main',

  isAddingCustomGraph: notEmpty('newCustomGraph'),
  newCustomGraph: null,
  customGraphs: computed('project', function() {
    return this.store.query('custom-graph', {
      project: this.project.id
    })
  }),
  customGraphSorting: Object.freeze(['order']),
  sortedCustomGraphs: sort('customGraphs', 'customGraphSorting'),
  maxCustomGraphOrder: readOnly('sortedCustomGraphs.lastObject.order'),

  // Builds for selected project on selected branch
  isLoadingBuilds: not('projectBuilds.isSettled'),
  projectBuilds: computed('project', 'branch', function() {
    return this.project
      ? this.store.query('circleci-build', {
        project: this.project.id,
        branch: this.branch
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
      let newOrder
        = this.maxCustomGraphOrder >= 0 ? this.maxCustomGraphOrder + 1 : 0
      this.newCustomGraph.set('order', newOrder)
      this.newCustomGraph.save().then(() => {
        this.set('newCustomGraph', null)
        this.notifyPropertyChange('customGraphs')
        this.set('accordionSelectedItem', `graph-${newOrder}`)
      })
    },

    graphChanged(action, graph) {
      if (action === 'moved') {
        this.set('accordionSelectedItem', `graph-${graph.order}`)
      } else if (action === 'deleted') {
        this.set('accordionSelectedItem', 'main')
      }

      this.notifyPropertyChange('customGraphs')
    }
  }
})
