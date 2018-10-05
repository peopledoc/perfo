import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default Route.extend({
  circleci: service(),

  actions: {
    setToken() {
      this.circleci.set('token', this.controller.authToken)

      this.circleci.userData.then((data) => {
        if (data) {
          this.controller.set('authToken', '')
          this.transitionTo('projects')
        }
      })
    },
    unsetToken() {
      this.circleci.set('token', null)
      this.transitionTo('index')
    }
  }
})
