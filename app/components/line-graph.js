import Component from '@ember/component'
import { computed } from '@ember/object'

export default Component.extend({
  graphType: 'spline',
  showLegend: true,

  valueTitle: 'Value',
  valueFormatter: (value) => value.toString(),

  chartOptions: computed(
    'graphType',
    'showLegend',
    'title',
    'valueTitle',
    'valueFormatter',
    function() {
      let { valueFormatter } = this

      return {
        chart: {
          height: '600px',
          type: this.graphType,
          zoomType: 'x'
        },
        legend: {
          enabled: this.showLegend
        },
        plotOptions: {
          spline: {
            lineWidth: 1,
            marker: {
              enabled: true,
              radius: 2
            }
          }
        },
        title: {
          text: ''
        },
        tooltip: {
          pointFormatter() {
            let {
              color,
              y,
              series: { name }
            } = this
            let value = valueFormatter(y)
            return `<span style="color:${color}">●</span> ${name}: <b>${value}</b><br/>.`
          }
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
