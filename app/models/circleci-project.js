import { computed } from '@ember/object'
import DS from 'ember-data'

const { Model, attr } = DS

export default Model.extend({
  // eslint-disable-next-line camelcase
  vcs_url: attr('string'),
  followed: attr('boolean'),
  username: attr('string'),
  reponame: attr('string'),

  displayName: computed('username', 'reponame', function() {
    return `${this.username}/${this.reponame}`
  })
})
