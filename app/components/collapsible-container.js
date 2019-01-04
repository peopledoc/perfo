import Component from '@ember/component'

export default Component.extend({
  title: 'Collapsible',
  isCollapsed: true,
  onToggle: null,
  classNames: ['collapsible'],
  classNameBindings: ['isCollapsed:collapsed:expanded'],

  actions: {
    toggleCollapsed() {
      this.set('isCollapsed', !this.isCollapsed)
      if (this.onToggle) {
        this.onToggle(this.isCollapsed)
      }
    }
  }
})
