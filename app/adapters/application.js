import DS from 'ember-data'
import { computed } from '@ember/object'

const { JSONAPIAdapter } = DS

export default JSONAPIAdapter.extend({
  headers: computed(function() {
    return {
      'Content-Type': 'application/json'
    }
  })
})
