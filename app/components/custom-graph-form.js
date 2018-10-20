import Component from '@ember/component'

export default Component.extend({
  model: null,

  title: null,
  submitLabel: null,
  submitAction: null,

  didRender() {
    this.element.scrollIntoView(false)
  },

  actions: {
    submit() {
      this.submitAction()
    }
  }
})
