import Service, { inject as service } from '@ember/service'
import { computed } from '@ember/object'
import { not, sort } from '@ember/object/computed'

export default Service.extend({
  store: service(),

  providers: computed(function() {
    return this.store.findAll('provider')
  }),
  isLoadingProjects: not('projects.isSettled'),
  projects: computed(function() {
    return this.store.findAll('project')
  }),
  projectsSorting: Object.freeze(['name']),
  sortedProjects: sort('projects', 'projectsSorting'),
  selectedProjectId: null,
  selectedProject: computed(
    'isLoadingProjects',
    'projects.@each',
    'selectedProjectId',
    function() {
      return this.isLoadingProjects
        ? null
        : this.projects.findBy('id', this.selectedProjectId)
    }
  ),

  selectedBranch: null
})
