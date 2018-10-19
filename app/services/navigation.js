import Service from '@ember/service'
import { inject as service } from '@ember/service'
import { computed } from '@ember/object'
import { readOnly, not, sort } from '@ember/object/computed'

export default Service.extend({
  circleci: service(),
  store: service(),

  isCircleCIReady: readOnly('circleci.isReady'),
  userName: readOnly('circleci.userData.name'),

  isLoadingProjects: not('projects.isSettled'),
  projects: computed('isCircleCIReady', function() {
    return this.isCircleCIReady
      ? this.store.findAll('circleci-project')
      : Promise.resolve([])
  }),
  projectsSorting: Object.freeze(['displayName']),
  sortedProjects: sort('projects', 'projectsSorting'),
  selectedProjectId: null,
  selectedProject: computed('isCircleCIReady', 'projects.@each', 'selectedProjectId', function() {
    return this.isCircleCIReady ? this.projects.findBy('id', this.selectedProjectId) : null
  }),

  selectedBranch: null
})
