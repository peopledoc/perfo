import CircleCIAdapter from 'perfo/adapters/circleci'

export default CircleCIAdapter.extend({
  urlForQuery(query) {
    if (!('project' in query)) {
      throw new Error(
        'urlForQuery called on adapter:circleci-artifact without a `project` query parameter'
      )
    }

    if (!('build' in query)) {
      throw new Error(
        'urlForQuery called on adapter:circleci-artifact without a `build` query parameter'
      )
    }

    let projectPath = query.project.replace(/:/g, '/')
    delete query.project

    let buildNum = query.build
    delete query.build

    return `${this.buildURL()}/project/${projectPath}/${buildNum}/artifacts`
  }
})
