import Controller from '@ember/controller'
import env from 'perfo/config/environment'
import { inject as service } from '@ember/service'

const { rootURL } = env

export default Controller.extend({
  rootURL,
  router: service(),

  actions: {
    navigationChanged(project, branch) {
      this.router.transitionTo('project-branch', {
        project: project.id,
        branch
      })
    }
  }
})
