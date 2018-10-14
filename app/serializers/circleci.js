import DS from 'ember-data'

const { JSONSerializer } = DS

export default JSONSerializer.extend({
  _generateItemID(model) {
    throw new Error(`${model} adapter does not implement _generateItemID`)
  },

  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    if (['query', 'findAll'].indexOf(requestType) !== -1) {
      for (let item of payload) {
        this._generateItemID(primaryModelClass, item)
      }
    }

    return this._super(store, primaryModelClass, payload, id, requestType)
  }
})
