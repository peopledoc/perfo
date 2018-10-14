import { readOnly } from '@ember/object/computed'
import { inject as service } from '@ember/service'
import DS from 'ember-data'

const { JSONAPIAdapter } = DS

export default JSONAPIAdapter.extend({
  circleci: service(),

  namespace: readOnly('circleci.namespace'),
  contentType: readOnly('circleci.contentType'),
  headers: readOnly('circleci.headers')
})
