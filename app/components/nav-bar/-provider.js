import Component from '@ember/component'
import { computed } from '@ember/object'

export default Component.extend({
  provider: null,

  tagName: 'span',
  attributeBindings: computed(() => ['title']),
  classNames: ['badge'],
  classNameBindings: ['provider.connected:badge-success:badge-danger'],
  title: computed('provider.{name,connected,account}', function() {
    let { name, connected, account } = this.provider
    if (connected) {
      return `${name}: connected as ${account}`
    } else {
      return `${name}: unavailable`
    }
  })
})
