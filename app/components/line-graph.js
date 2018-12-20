import Component from '@ember/component'
import { computed } from '@ember/object'

export default Component.extend({
  graphType: 'line',
  showLegend: true,

  valueTitle: 'Value',
  valueFormatter: (value) => value.toString(),

  chartOptions: computed(
    'graphType',
    'showLegend',
    'valueTitle',
    'valueFormatter',
    function() {
      let { graphType, showLegend, valueFormatter, valueTitle } = this
      let graphOptions = {
        lineWidth: 1,
        marker: {
          enabled: true,
          radius: 2
        }
      }
      let plotOptions = {}

      if (graphType === 'stacked') {
        graphType = 'area'
        graphOptions.stacking = 'normal'
      }

      plotOptions[graphType] = graphOptions

      return {
        chart: {
          height: '600px',
          type: graphType,
          zoomType: 'xy'
        },
        legend: {
          enabled: showLegend
        },
        plotOptions,
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
            formatter: (data) => valueFormatter(data.value)
          },
          title: { text: valueTitle }
        }
      }
    }
  ),

  chartData: null
})
