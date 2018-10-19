import Component from '@ember/component'

export default Component.extend({
  model: null,

  title: null,
  submitLabel: 'Submit',
  submitAction: null,

  actions: {
    submit() {
      this.submitAction()
    }
  }
})
