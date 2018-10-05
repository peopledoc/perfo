import Controller from '@ember/controller'
import { readOnly } from '@ember/object/computed'
import { inject as service } from '@ember/service'

export default Controller.extend({
  circleci: service(),
  isCircleCIReady: readOnly('circleci.userData.isSettled'),
  userName: readOnly('circleci.userData.name')
})
