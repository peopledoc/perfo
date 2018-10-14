import { computed } from '@ember/object'
import DS from 'ember-data'

const { Model, attr, hasMany } = DS

export default Model.extend({
  // eslint-disable-next-line camelcase
  vcs_url: attr(),
  followed: attr('boolean'),
  username: attr(),
  reponame: attr(),

  builds: hasMany('circleci-build', { async: true }),

  displayName: computed('username', 'reponame', function() {
    return `${this.username}/${this.reponame}`
  })
})
