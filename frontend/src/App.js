import React, { Component } from 'react'
import { Layout, Menu, Select, Row, Col } from 'antd'
import './App.css'
import ReactEcharts from 'echarts-for-react'
import axios from 'axios'
import Graph from './Graph/Graph'
import _ from 'lodash'
const { Header, Content } = Layout
const Option = Select.Option

const ChartSettings = (x, y) => ({
  yAxis: {
    type: 'value'
  },
  xAxis: {
    type: 'category',
    data: x
  },
  series: [{
    data: y,
    type: 'line',
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
})

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      skeleton: null,
      backend: 'opencl',
      machine: 'GTX780',
      benchmark: "futhark-benchmarks/misc/radix_sort/radix_sort.fut",
      dataset: 'data/radix_sort_100.in',
      benchmarks: null,
      commits: []
    }

    this.changeBackend = this.changeBackend.bind(this)
    this.changeMachine = this.changeMachine.bind(this)
    this.changeBenchmark = this.changeBenchmark.bind(this)
    this.changeDataset = this.changeDataset.bind(this)
  }

  componentDidMount() {
    axios('http://localhost:8080/metadata.json', {
      mode: "cors"
    })
    .then(response => {
      const parsed = response.data
      this.setState({
        benchmarks: parsed.benchmarks,
        skeleton: parsed.skeleton,
        commits: parsed.commits,
      })
    })
    .catch(console.error)
  }

  changeMachine(machine) {
    this.setState({
      benchmark: null,
      dataset: null,
      machine
    })
  }

  changeDataset(dataset) {
    this.setState({
      dataset
    })
  }

  changeBenchmark(benchmark) {
    var {skeleton} = this.state
    this.setState({
      dataset: null,
      benchmark
    })
  }

  changeBackend(backend) {
    this.setState({
      machine: null,
      benchmark: null,
      dataset: null,
      backend
    })
  }

  downloadData() {
    const {backend, skeleton, machine} = this.state
    if (
      skeleton != null &&
      backend != null &&
      machine != null &&
      Object.keys(skeleton[backend][machine]).length === 0
    ) {
      axios(`http://localhost:8080/data-split/${backend}/${machine}.json`, {
        mode: "cors"
      })
      .then(response => {
        const parsed = response.data
        skeleton[backend][machine] = parsed
        this.setState({
          skeleton: skeleton
        })
      })
      .catch(console.error)
    }
  }

  render() {
    const {
      benchmarks,
      skeleton,
      backend,
      machine,
      benchmark,
      dataset,
      commits
    } = this.state

    if (skeleton == null)
      return <div>Loading</div>

    this.downloadData()

    const backends = skeleton != null ? Object.keys(skeleton) : []
    const machines = backend != null && skeleton[backend] != null ? Object.keys(skeleton[backend]) : []
    const benchmarkKeys = benchmarks != null ? Object.keys(benchmarks) : []
    const datasets = ( benchmarks != null && benchmark != null ) ? benchmarks[benchmark] : []
    let x = []
    let y = []

    if (dataset != null) {
      const rawData = skeleton[backend][machine]
      let refinedData = []

      for (const rawDataKey in rawData) {
        const datapoint = {
          commit: rawDataKey,
          date: new Date(commits[rawDataKey]),
        }

        const datasetData = _.get(rawData, [rawDataKey, benchmark, 'datasets', dataset], null)

        if (datasetData == null)
          continue

        datapoint['avg'] = datasetData['avg']
        datapoint['stdDev'] = datasetData['stdDev']

        refinedData.push(datapoint)
      }

      refinedData = refinedData.sort((a, b) => a.date - b.date)
      refinedData = refinedData.map(e => [e.date, e.avg])
      const unzipped = _.unzip(refinedData)
      x = unzipped[0]
      y = unzipped[1]
    }

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
          <Layout
             style={{ padding: '24px', height: "calc(100vh - 64px)" }}
          >
            <Content>
              <Row gutter={16}>
                <Col span={2}>
                  { backends != null &&
                    <Select
                      onChange={this.changeBackend}
                      style={{ width: "100%", display: "block" }}
                      showSearch={true}
                      autoFocus={true}
                      value={backend != null ? backend : undefined}
                    >
                      {backends.map(backend => (
                        <Option
                          value={backend}
                          key={backend}
                        >
                          {backend}
                        </Option>
                      ))}
                    </Select>
                  }
                </Col>
                <Col span={2}>
                  { backend != null && skeleton[backend] != null &&
                    <Select
                      style={{ width: "100%", display: "block" }}
                      onChange={this.changeMachine}
                      showSearch={true}
                      autoFocus={true}
                      value={machine != null ? machine : undefined}
                    >
                      {machines.map(machine => (
                        <Option
                          key={machine}
                          value={machine}
                        >
                          {machine}
                        </Option>
                      ))}
                    </Select>
                  }
                </Col>
                <Col span={4}>
                  { machine != null && benchmarks != null &&
                    <Select
                      style={{ width: "100%", display: "block" }}
                      onChange={this.changeBenchmark}
                      showSearch={true}
                      autoFocus={true}
                      value={benchmark != null ? benchmark : undefined}
                    >
                      {benchmarkKeys.map(benchmark => (
                        <Option
                          key={benchmark}
                          value={benchmark}
                        >
                          {benchmark.replace("futhark-benchmarks/", "")}
                        </Option>
                      ))}
                    </Select>
                  }
                </Col>
                <Col span={4}>
                  { benchmark != null && datasets != null &&
                    <Select
                      style={{ width: "100%", display: "block" }}
                      onChange={this.changeDataset}
                      showSearch={true}
                      autoFocus={true}
                      value={dataset != null ? dataset : undefined}
                    >
                      {datasets.map(dataset => (
                        <Option
                          key={dataset}
                          value={dataset}
                        >
                          {dataset}
                        </Option>
                      ))}
                    </Select>
                  }
                </Col>
              </Row>
              { dataset != null &&
                <Row>
                  <Col span={24}>
                    <ReactEcharts
                      option={ChartSettings(x, y)}
                      notMerge={true}
                      lazyUpdate={true}
                      theme={"dark"}
                      opts={{}}
                    />
                  </Col>
                </Row>
              }
            </Content>
          </Layout>
        </Layout>
      </div>
    )
  }
}

export default App
