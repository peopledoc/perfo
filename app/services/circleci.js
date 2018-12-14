import { computed } from '@ember/object'
import { readOnly } from '@ember/object/computed'
import AjaxService from 'ember-ajax/services/ajax'
import DS from 'ember-data'
import env from 'perfo/config/environment'

const { rootURL } = env
const { PromiseObject } = DS

export default AjaxService.extend({
  namespace: `${rootURL}circleci`,
  contentType: 'application/json; charset=UTF-8',

  userData: computed(function() {
    return PromiseObject.create({
      promise: this.request('/me')
        .then((data) => data)
        .catch(() => null)
    })
  }),
  userName: readOnly('userData.name'),
  isReady: readOnly('userData.isSettled')
})
