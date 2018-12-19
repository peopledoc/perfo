import ApplicationSerializer from './application'

export default ApplicationSerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    if (requestType === 'query') {
      payload.forEach((item, index) => (item.id = index))
    }

    return this._super(store, primaryModelClass, payload, id, requestType)
  }
})
