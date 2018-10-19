import Component from '@ember/component'
import { computed } from '@ember/object'

export default Component.extend({
  title: null,
  graphType: 'spline',

  valueTitle: 'Value',
  valueFormatter: (value) => value.toString(),

  chartOptions: computed(
    'title',
    'graphType',
    'valueTitle',
    'valueFormatter',
    function() {
      return {
        chart: {
          height: '600px',
          type: this.graphType,
          zoomType: 'x'
        },
        plotOptions: {
          spline: {
            marker: {
              enabled: true
            }
          }
        },
        title: {
          text: `${
            this.title
          }<br><i style="font-size: .8em;">(click and drag to zoom)</i>`
        },
        xAxis: { type: 'datetime', title: { text: 'Date' } },
        yAxis: {
          labels: {
            formatter: (data) => this.valueFormatter(data.value)
          },
          title: { text: this.valueTitle }
        }
      }
    }
  ),

  chartData: null
})
