import Component from '@ember/component'

export default Component.extend({
  title: 'Collapsible',
  isCollapsed: true,
  classNames: ['collapsible'],
  classNameBindings: ['isCollapsed:collapsed:expanded']
})
