import ApplicationAdapter from './application'

export default ApplicationAdapter.extend({
  urlForFindAll() {
    return '/projects/providers'
  }
})
