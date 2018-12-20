import DS from 'ember-data'
import env from 'perfo/config/environment'
import { computed } from '@ember/object'

const { rootURL } = env
const { JSONAPIAdapter } = DS

export default JSONAPIAdapter.extend({
  namespace: `${rootURL}${rootURL.endsWith('/') ? '' : '/'}api`,
  headers: computed(function() {
    return {
      'Content-Type': 'application/json'
    }
  })
})
