import Component from '@ember/component'
import { computed } from '@ember/object'
import { notEmpty } from '@ember/object/computed'
import { inject as service } from '@ember/service'

export default Component.extend({
  store: service(),

  graph: null,
  graphChangedAction: null,

  editingData: null,
  isEditing: notEmpty('editingData'),

  customGraphs: computed('graph', function() {
    return this.graph
      ? this.store.query('custom-graph', { project: this.graph.project })
      : []
  }),

  actions: {
    toggleEditCustomGraph(graph) {
      if (this.editingData) {
        this.set('editingData', null)
      } else {
        this.set('editingData', {
          title: graph.title,
          jobName: graph.jobName,
          artifactMatches: graph.artifactMatches,
          branchMatches: graph.branchMatches,
          showLegend: graph.showLegend,
          formatter: graph.formatter
        })
      }
    },

    saveCustomGraph(graph) {
      graph.setProperties(this.editingData)
      graph.save().then(() => {
        this.set('editingData', null)
        this.graphChangedAction('edited', graph)
      })
    }
  }
})
