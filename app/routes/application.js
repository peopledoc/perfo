import Route from '@ember/routing/route'
import { inject as service } from '@ember/service'

export default Route.extend({
  circleci: service(),

  model() {
    return this.store.findAll('circleci-project')
  },

  actions: {
    setToken() {
      this.circleci.set('token', this.controller.authToken)

      this.circleci.userData.then((data) => {
        if (data) {
          this.controller.set('authToken', '')
        }
      })
    },

    unsetToken() {
      this.circleci.set('token', null)
    }
  }
})
