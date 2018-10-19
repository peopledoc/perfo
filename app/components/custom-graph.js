import { computed } from '@ember/object'
import { readOnly } from '@ember/object/computed'
import { inject as service } from '@ember/service'
import DS from 'ember-data'
import LineGraph from 'perfo/components/line-graph'

const { PromiseArray } = DS

export default LineGraph.extend({
  store: service(),
  circleci: service(),

  project: null,
  jobName: null,
  artifactMatches: null,
  artifactRegex: computed('artifactMatches', function() {
    return new RegExp(`/${this.artifactMatches}/`)
  }),
  projectBuilds: computed(() => []),

  isLoadingBuilds: readOnly('projectBuilds.isSettled'),
  projectHasJob: computed('jobName', 'projectBuilds.@each', function() {
    return this.projectBuilds.any(
      (build) =>
        this.jobName ? build.workflows.job_name === this.jobName : true
    )
  }),

  builds: computed('jobName', 'projectBuilds.@each', function() {
    return this.projectBuilds
      .filter(
        (build) =>
          this.jobName ? build.workflows.job_name === this.jobName : true
      )
      .filterBy('has_artifacts', true)
  }),

  dataArtifacts: computed(
    'project',
    'artifactRegex',
    'builds.@each',
    function() {
      let { builds } = this

      return new PromiseArray({
        promise: Promise.all(
          builds.map((build) =>
            this.store.query('circleci-artifact', {
              project: this.project.id,
              build: build.build_num
            })
          )
        ).then((artifactLists) => {
          // Extract for each artifact list the first that matches the requested path
          let artifacts = artifactLists.map((list) => {
            return list.find((a) => this.artifactRegex.test(a.path))
          })

          // Fetch artifact data
          return (
            Promise.all(
              artifacts.map((artifact) => {
                if (artifact) {
                  return this.circleci.request(
                    `/download?url=${encodeURIComponent(artifact.url)}`
                  )
                } else {
                  return Promise.resolve(null)
                }
              })
            )
              // Zip artifact data together with the corresponding build and remove empty ones
              .then((payloads) =>
                payloads
                  .map((data, index) => {
                    return { data, build: builds[index] }
                  })
                  .filter((item) => item.data)
              )
          )
        })
      })
    }
  ),

  chartData: computed('dataArtifacts.@each', function() {
    let series = this.dataArtifacts.reduce(function(series, set) {
      return series.concat(set.data.map((point) => point.label))
    }, [])

    return [...new Set(series)].map((name) => {
      return {
        name,
        data: this.dataArtifacts.map((set) => [
          set.build.start_date,
          set.data.find((point) => point.label === name).value
        ])
      }
    })
  })
})
