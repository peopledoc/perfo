import Route from '@ember/routing/route'

export default Route.extend({
  actions: {
    navigationChanged(project, branch) {
      this.transitionTo('project-branch', {
        project: project.id,
        branch
      })
    }
  }
})
