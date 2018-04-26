import React, { Component } from 'react'
import {
  Row,
  Col
} from 'antd'
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
      dataset,
      data,
      backend,
      speedUpMax,
      graphType,
      benchmark,
      machine,
      x,
      y,
      xCommits,
    } = this.props

    if ( dataset === null || data === null )
      return null

    return (
      <Row>
        <Col span={24}>
          <Line
            height={300}
            onElementsClick={(elements) => {
              if (elements.length == 0)
                return

              const element = elements[0]
              const revision = xCommits[element._index]
              const githubUrl = `https://github.com/diku-dk/futhark/commit/${revision}`

              window.open(githubUrl, '_blank')
            }}
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
                    //min: 1,
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
              labels: x,
              datasets: [
                {
                  label: `${backend}/${machine}/${benchmark}/${dataset}`,
                  fill: false,
                  lineTension: 0.1,
                  backgroundColor: 'rgba(75,192,192,0.4)',
                  borderColor: 'rgba(75,192,192,1)',
                  borderCapStyle: 'butt',
                  borderDash: [],
                  borderDashOffset: 0.0,
                  borderJoinStyle: 'miter',
                  pointBorderColor: 'rgba(75,192,192,1)',
                  pointBackgroundColor: '#fff',
                  pointBorderWidth: 1,
                  pointHoverRadius: 5,
                  pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                  pointHoverBorderColor: 'rgba(220,220,220,1)',
                  pointHoverBorderWidth: 2,
                  pointRadius: 1,
                  pointHitRadius: 10,
                  data: y
                }
              ]
            }}
          />
        </Col>
      </Row>
    )
  }
}

export default Graph
