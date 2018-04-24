import React, { Component } from 'react'
import {
  Row,
  Col
} from 'antd'
import _ from 'lodash'
import {Line} from "react-chartjs-2"

class Graph extends Component {
  static propTypes = {
  };

  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    const {
      commits,
      skeleton,
      selected,
      speedUpMax,
      graphType
    } = this.props

    let datasets = []

    const colors = [
      "75,192,192", // Green
      "255,138,128", // Red
      "48,79,254",
      "0,105,92",
      "76,175,80",
      "238,255,65",
      "255,193,7", // Orange
      "121,85,72" // Brown
    ]

    for ( let pathIndex in selected ) {
      const path = selected[pathIndex]
      const {
        backend,
        machine,
        benchmark,
        dataset
      } = path

      if ( dataset != null ) {
        const rawData = skeleton[backend][machine]
        let refinedData = []

        for (const rawDataKey in rawData) {
          const datapoint = {
            commit: rawDataKey,
            date: new Date(commits[rawDataKey]),
          }

          const datasetData = _.get(rawData, [rawDataKey, benchmark, 'datasets', dataset], null)

          if (datasetData === null)
            continue

          datapoint['avg'] = datasetData['avg']
          datapoint['stdDev'] = datasetData['stdDev']

          refinedData.push(datapoint)
        }

        refinedData = refinedData.sort((a, b) => a.date - b.date)
        let XY = refinedData.map(e => ({x: e.date, y: e.avg}))
        let Y = refinedData.map(e => e.avg)
        
        if (graphType === 'speedup' && Y !== undefined) {
          const minY = Math.min(...Y)
          XY = XY.map(({x,y}) => ({x, y: (y / minY).toFixed(2)}))
        }

        datasets.push({
          label: `${backend}/${machine}/${benchmark}/${dataset}`,
          fill: false,
          lineTension: 0.1,
          backgroundColor: `rgba(${colors[pathIndex]},0.4)`,
          borderColor: `rgba(${colors[pathIndex]},1)`,
          borderCapStyle: `butt`,
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: `miter`,
          pointBorderColor: `rgba(${colors[pathIndex]},1)`,
          pointBackgroundColor: `#fff`,
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: `rgba(${colors[pathIndex]},1)`,
          pointHoverBorderColor: `rgba(220,220,220,1)`,
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
            data: XY
        })
      }
    }

    return (
      <Row>
        <Col span={24}>
          <Line
            height={300}
            options={{
              maintainAspectRatio: false,
              title: {
                text: 'Benchmark results'
              },
              scales: {
                xAxes: [{
                  type: 'time',
                  time: {
                    parser: 'MM/DD/YYYY HH:mm',
                    tooltipFormat: 'll HH:mm'
                  },
                  scaleLabel: {
                    display: true,
                    labelString: 'Date'
                  }
                }],
                yAxes: [{
                  ticks: {
                    max: (graphType === "speedup") ? speedUpMax : undefined
                  },
                  scaleLabel: {
                    display: true,
                    labelString: 'value'
                  }
                }]
              }
            }}
            data={{
              datasets: datasets
            }}
          />
        </Col>
      </Row>
    )
  }
}

export default Graph
