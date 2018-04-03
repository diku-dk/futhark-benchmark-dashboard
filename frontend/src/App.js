import React, { Component } from 'react'
import { Layout, Menu, Select } from 'antd'
import './App.css'
import ReactEcharts from 'echarts-for-react'
import axios from 'axios'
import Graph from './Graph/Graph'
const { Header, Content } = Layout
const Option = Select.Option

const ChartSettings = {
  yAxis: {
      type: 'value'
  },
  xAxis: {
      type: 'category',
      data: ["20-07-2017", "21-07-2017", "22-07-2017", "23-07-2017", "24-07-2017", "25-07-2017", "26-07-2017"]
  },
  series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1500],
      type: 'line',
      markPoint: {
        data: [
          {name : 'Test', value : 820, xAxis: "20-07-2017", yAxis: 820}
        ]
      },
      markLine : {
            data : [
                {
                  type : 'average', 
                  name : 'Average',
                  label: {
                        normal: {
                            position: 'end',
                            formatter: 'Average'
                        }
                    }
              },
                [{
                    symbol: 'none',
                    x: '90%',
                    yAxis: 'max'
                }, {
                    symbol: 'circle',
                    label: {
                        normal: {
                            position: 'start',
                            formatter: 'Max'
                        }
                    },
                    type: 'max',
                    name: 'Max'
                }]
            ]
        }
  }],
  title: {
      text: 'Performance',
      subtext: "Benchmarks"
  },
  legend: {
      data: ['Punch Card'],
      left: 'right'
  },
  tooltip: {
      formatter: function (params) {
        return params.value
      }
  },
  toolbox: {
    right: 40,
      show : true,
      feature : {
          dataView : {
            show: true,
            readOnly: false,
            title: "Dataview",
            lang: ["Data view", "Turn off", "Refresh"]
          },
          magicType : {
            show: true,
            type: ['line', 'bar'],
            title: {
              line: "Line",
              bar: "Bar"
            },
            showTitle: true
        },
          restore : {
            show: true,
            title: "Restore"
          },
          saveAsImage : {
            show: true,
            title: "Save as Image"
          }
      }
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      skeleton: null
    }
  }

  componentDidMount () {
    axios('http://localhost:8080/metadata.json', {
      mode: "cors"
    })
    .then(response => {
      const parsed = response.data
      this.setState({
        skeleton: parsed.skeleton,
        commits: parsed.commits,
      })
    })
    .catch(console.error)
  }

  render() {
    const {
      skeleton
    } = this.state

    const backends = skeleton != null ? Object.keys(skeleton) : []

    return (
      <div className="app">
        <Layout className="layout">
          <Header>
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['2']}
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item key="home">Home</Menu.Item>
            </Menu>
          </Header>
          <Content style={{ padding: '0 50px' }}>
            <Select>
              {backends.map(backend => (
                <Option value={backend}>
                  {backend}
                </Option>
              ))}
            </Select>
          </Content>
        </Layout>
      </div>
    )
  }
}

export default App
