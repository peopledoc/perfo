import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default Route.extend({
  navigation: service(),

  model(params) {
    this.navigation.set('selectedProjectId', params.project)
    this.navigation.set('selectedBranch', params.branch)

    return this.store
      .query('custom-graph', {
        project: params.project
      })
      .sortBy('order')
  }
})