import Component from '@ember/component'
import { alias, readOnly } from '@ember/object/computed'
import { inject as service } from '@ember/service'

export default Component.extend({
  navigation: service(),

  selectedProjectId: alias('navigation.selectedProjectId'),
  selectedBranch: alias('navigation.selectedBranch'),
  selectedProject: readOnly('navigation.selectedProject'),
  isLoadingProjects: readOnly('navigation.isLoadingProjects'),
  sortedProjects: readOnly('navigation.sortedProjects'),
  providers: readOnly('navigation.providers'),

  navigationAction: null,

  actions: {
    selectProject(project) {
      this.set('selectedProjectId', project.id)
      this.send('selectBranch', 'master')
    },

    selectBranch(branch) {
      this.set('selectedBranch', branch)
      this.navigationAction(this.selectedProject, this.selectedBranch)
    }
  }
})
