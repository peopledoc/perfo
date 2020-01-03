import Component from '@ember/component'
import { computed } from '@ember/object'
import { computed as overridable } from 'ember-overridable-computed'

export default Component.extend({
  model: null,

  title: null,
  submitLabel: null,
  submitAction: null,
  jobNames: overridable(() => []),

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
