import Component from '@ember/component'
import { computed } from '@ember/object'

export default Component.extend({
  model: null,

  title: null,
  submitLabel: null,
  submitAction: null,
  jobNames: computed(() => []),

  jobHelpText: computed('jobNames', function() {
    return this.jobNames.length
      ? `Available jobs for this project: ${this.jobNames.join(', ')}`
      : ''
  }),

  didRender() {
    this.element.scrollIntoView(false)
  },

  actions: {
    submit() {
      this.submitAction()
    }
  }
})
