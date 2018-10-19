import Component from '@ember/component'
import { alias, readOnly } from '@ember/object/computed'
import { inject as service } from '@ember/service'

export default Component.extend({
  circleci: service(),
  isCircleCIReady: readOnly('circleci.isReady'),
  circleUserName: readOnly('circleci.userName'),
  circleToken: alias('circleci.token'),

  navigation: service(),
  selectedProjectId: alias('navigation.selectedProjectId'),
  selectedBranch: alias('navigation.selectedBranch'),
  selectedProject: readOnly('navigation.selectedProject'),
  isLoadingProjects: readOnly('navigation.isLoadingProjects'),
  sortedProjects: readOnly('navigation.sortedProjects'),

  navigationAction: null,

  actions: {
    setToken() {
      this.set('circleToken', this.authToken)
      this.circleci.userData.then((data) => {
        if (data) {
          this.set('authToken', '')
        }
      })
    },

    unsetToken() {
      this.set('circleToken', null)
    },

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
