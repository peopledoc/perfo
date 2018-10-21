import Component from '@ember/component'
import { computed } from '@ember/object'
import { sort, readOnly } from '@ember/object/computed'
import { inject as service } from '@ember/service'

export default Component.extend({
  store: service(),

  tagName: '',

  graph: null,
  graphChangedAction: null,

  customGraphs: computed('graph', function() {
    return this.graph
      ? this.store.query('custom-graph', { project: this.graph.project })
      : []
  }),
  customGraphSorting: Object.freeze(['order']),
  sortedCustomGraphs: sort('customGraphs', 'customGraphSorting'),
  maxCustomGraphOrder: readOnly('sortedCustomGraphs.lastObject.order'),

  actions: {
    toggleConfirmRemoveCustomGraph(graph) {
      graph.set('isDeleting', !graph.isDeleting)
    },

    deleteCustomGraph(graph) {
      let { deletedOrder } = graph
      graph.destroyRecord().then(() => {
        Promise.all(
          this.customGraphs.filter((g) => g.order > deletedOrder).map((g) => {
            g.order--
            return g.save()
          })
        ).then(() => {
          this.notifyPropertyChange('customGraphs')
          this.graphChangedAction('deleted', graph)
        })
      })
    },

    moveCustomGraph(graph, direction) {
      let { order: originalOrder } = graph

      if (direction === 'up' && originalOrder > 0) {
        graph.set('order', originalOrder - 1)
      } else if (
        direction === 'down'
        && originalOrder < this.maxCustomGraphOrder
      ) {
        graph.set('order', originalOrder + 1)
      }

      if (graph.order !== originalOrder) {
        let swapWith = this.customGraphs.find(
          (g) => g !== graph && g.order === graph.order
        )
        swapWith.set('order', originalOrder)
        Promise.all([graph.save(), swapWith.save()]).then(() =>
          this.graphChangedAction('moved', graph)
        )
      }
    }
  }
})
