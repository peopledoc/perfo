import { computed } from '@ember/object'
import { not, readOnly } from '@ember/object/computed'
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
  graphType: readOnly('graph.graphType'),

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

  isLoadingData: not('dataSets.isSettled'),
  dataSets: computed(
    'project.id',
    'branch',
    'graph.{id,jobName,artifactMatches}',
    function() {
      return this.store.query('dataset', {
        project: this.project.id,
        branch: this.branch,
        customGraph: this.graph.id
      })
    }
  ),

  chartData: computed('dataSets.@each', function() {
    // Extract list of unique labels from all artifacts
    let seriesNames = [
      ...new Set(
        this.dataSets.reduce(function(seriesNames, set) {
          return seriesNames.concat(set.points.map((point) => point.label))
        }, [])
      )
    ]

    // Extract timestamps
    let timestamps = this.dataSets.map((set) => set.date)

    // Index datasets by date
    let dataSets = this.dataSets.reduce((dataSets, set) => {
      dataSets[set.date] = set
      return dataSets
    }, {})

    // Build one series for each unique label with matching data points at each
    // timestamp, filling missing timestamps with zeroes
    return seriesNames.map((name) => {
      return {
        name,
        data: timestamps.map((timestamp) => {
          let set = dataSets[timestamp]
          let point = set.points.find((point) => point.label === name)
          return {
            x: timestamp,
            y: point ? point.value : 0,
            name: `${set.subject}<br><i>${set.revision}</i>`
          }
        })
      }
    })
  })
})
