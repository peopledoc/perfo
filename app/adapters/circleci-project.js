import CircleCIAdapter from 'perfo/adapters/circleci'

export default CircleCIAdapter.extend({
  urlForFindAll() {
    return `${this.buildURL()}/projects`
  }
})
