import Controller from '@ember/controller'
import env from 'perfo/config/environment'

const { rootURL } = env

export default Controller.extend({
  rootURL
})
