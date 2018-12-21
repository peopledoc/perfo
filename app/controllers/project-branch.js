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
      ? this.store.query('build', {
        project: this.project.id,
        branch: this.branch
      })
      : Promise.resolve([])
  }),
  projectJobNames: computed('projectBuilds.@each', function() {
    return [...new Set(this.projectBuilds.map((build) => build.job))].sort()
  }),

  buildsSorting: Object.freeze(['start']),
  sortedBuilds: sort('projectBuilds', 'buildsSorting'),

  actions: {
    toggleAddCustomGraph() {
      if (this.newCustomGraph) {
        this.set('newCustomGraph', null)
      } else {
        this.set(
          'newCustomGraph',
          this.store.createRecord('custom-graph', {
            project: this.project.id,
            order: 0,
            showLegend: true,
            formatter: 'none',
            graphType: 'line'
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
      })
    },

    graphChanged() {
      this.notifyPropertyChange('customGraphs')
    }
  }
})
