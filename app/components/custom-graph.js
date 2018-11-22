import { computed } from '@ember/object'
import { readOnly } from '@ember/object/computed'
import { inject as service } from '@ember/service'
import DS from 'ember-data'
import LineGraph from 'perfo/components/line-graph'
import {
  sizeFormatter,
  secondsFormatter,
  millisecondsFormatter
} from 'perfo/utils/formatters'

const { PromiseArray } = DS

async function fetchData({ circleci, store, project, builds, artifactRegex }) {
  // Get a list of artifacts for each build
  let artifactLists = await Promise.all(
    builds.map((build) =>
      store.query('circleci-artifact', {
        project: project.id,
        build: build.build_num
      })
    )
  )

  // Extract for each artifact list the first that matches the requested path
  let matchingArtifacts = artifactLists.map((list) => {
    return list.find((a) => artifactRegex.test(a.path))
  })

  // Fetch data for each matching artifact
  let artifactData = await Promise.all(
    matchingArtifacts.map(
      (artifact) =>
        artifact
          ? circleci.request(
            `/download?url=${encodeURIComponent(artifact.url)}`
          )
          : Promise.resolve(null)
    )
  )

  return Promise.resolve(
    artifactData
      // Zip artifact data with corresponding build
      .map((data, index) => {
        return { data, build: builds[index] }
      })
      // Remove empty ones
      .filter((item) => item.data)
  )
}

export default LineGraph.extend({
  store: service(),
  circleci: service(),

  project: null,
  graph: null,

  jobName: readOnly('graph.jobName'),
  artifactMatches: readOnly('graph.artifactMatches'),
  showLegend: readOnly('graph.showLegend'),

  valueTitle: computed('graph.formatter', function() {
    if (
      this.graph.formatter === 'duration_sec'
      || this.graph.formatter === 'duration_ms'
    ) {
      return 'Duration'
    } else if (this.graph.formatter === 'size') {
      return 'Size'
    } else {
      return 'Value'
    }
  }),
  valueFormatter: computed('graph.formatter', function() {
    if (this.graph.formatter === 'duration_sec') {
      return secondsFormatter
    } else if (this.graph.formatter === 'duration_ms') {
      return millisecondsFormatter
    } else if (this.graph.formatter === 'size') {
      return sizeFormatter
    } else {
      return (x) => x
    }
  }),

  artifactRegex: computed('artifactMatches', function() {
    return new RegExp(this.artifactMatches)
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
      return new PromiseArray({ promise: fetchData(this) })
    }
  ),

  chartData: computed('dataArtifacts.@each', function() {
    // Extract list of unique labels from all artifacts
    let seriesNames = [
      ...new Set(
        this.dataArtifacts.reduce(function(seriesNames, set) {
          return seriesNames.concat(set.data.map((point) => point.label))
        }, [])
      )
    ]

    // Build one series for each unique label with all data points with that
    // label from all artifacts
    return seriesNames.map((name) => {
      return {
        name,
        data: this.dataArtifacts
          // filter out artifacts without a point with that label
          .filter((set) => set.data.find((point) => point.label === name))
          // Generate data points
          .map((set) => [
            set.build.start_time,
            set.data.find((point) => point.label === name).value
          ])
      }
    })
  })
})
