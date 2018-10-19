import { computed } from '@ember/object'
import { readOnly } from '@ember/object/computed'
import AjaxService from 'ember-ajax/services/ajax'
import DS from 'ember-data'

const { PromiseObject } = DS
const LS_KEY = 'circleci-auth-token'

export default AjaxService.extend({
  namespace: '/circleci',
  contentType: 'application/json; charset=UTF-8',
  headers: computed('token', function() {
    let headers = {}
    if (this.token) {
      let base64Token = btoa(`${this.token}:`)
      headers.authorization = `Basic ${base64Token}`
    }
    return headers
  }),

  token: computed({
    get() {
      return localStorage.getItem(LS_KEY)
    },
    set(_, value) {
      localStorage.setItem(LS_KEY, value)
      return value
    }
  }),
  userData: computed('token', function() {
    return PromiseObject.create({
      promise: this.request('/me')
        .then((data) => data)
        .catch(() => null)
    })
  }),
  userName: readOnly('userData.name'),
  isReady: readOnly('userData.isSettled')
})
