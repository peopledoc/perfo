import JSONAPIAdapter from '@ember-data/adapter/json-api'
import env from 'perfo/config/environment'
import { computed } from '@ember/object'

const { rootURL } = env

export default JSONAPIAdapter.extend({
  namespace: `${rootURL}${rootURL.endsWith('/') ? '' : '/'}api`,
  headers: computed(function() {
    return {
      'Content-Type': 'application/json'
    }
  })
})
