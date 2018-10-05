import { readOnly } from '@ember/object/computed'
import { inject as service } from '@ember/service'
import { camelize } from '@ember/string'
import DS from 'ember-data'
import { pluralize } from 'ember-inflector'

const { JSONAPIAdapter } = DS

export default JSONAPIAdapter.extend({
  circleci: service(),

  namespace: readOnly('circleci.namespace'),
  contentType: readOnly('circleci.contentType'),
  headers: readOnly('circleci.headers'),

  pathForType(type) {
    return camelize(pluralize(type.replace('circleci', '')))
  }
})
