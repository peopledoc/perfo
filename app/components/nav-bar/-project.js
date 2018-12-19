import Component from '@ember/component'
import { computed } from '@ember/object'
import { inject as service } from '@ember/service'

export default Component.extend({
  tagName: '',

  navigation: service(),

  project: null,
  provider: computed(
    'navigation.providers.@each',
    'project.provider',
    function() {
      return this.navigation.providers.find(
        (provider) => provider.id === this.project.provider
      )
    }
  )
})
