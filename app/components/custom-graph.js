import { computed } from '@ember/object'
import { readOnly } from '@ember/object/computed'
import { inject as service } from '@ember/service'
import LineGraph from 'perfo/components/line-graph'
import {
  sizeFormatter,
  secondsFormatter,
  millisecondsFormatter
} from 'perfo/utils/formatters'

export default LineGraph.extend({
  store: service(),

  project: null,
  branch: null,
  graph: null,

  jobName: readOnly('graph.jobName'),
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

  dataArtifacts: computed(
    'project.id',
    'branch',
    'graph.{id,artifactMatches}',
    function() {
      return this.store.query('dataset', {
        project: this.project.id,
        branch: this.branch,
        customGraph: this.graph.id
      })
    }
  ),

  chartData: computed('dataArtifacts.@each', function() {
    // Extract list of unique labels from all artifacts
    let seriesNames = [
      ...new Set(
        this.dataArtifacts.reduce(function(seriesNames, set) {
          return seriesNames.concat(set.points.map((point) => point.label))
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
          .filter((set) => set.points.find((point) => point.label === name))
          // Generate data points
          .map((set) => [
            set.date,
            set.points.find((point) => point.label === name).value
          ])
      }
    })
  })
})
