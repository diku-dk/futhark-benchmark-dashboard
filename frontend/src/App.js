import React, { Component } from 'react'
import { 
  Layout,
  Menu,
  Select,
  Row,
  Col,
  Switch,
  Slider,
  InputNumber
} from 'antd'
import Graph from './Graph/Graph'
import './App.css'
import axios from 'axios'
import _ from 'lodash'
const { Header, Content } = Layout
const Option = Select.Option

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
      commits: [],
      graphType: "speedup",
      speedUpMax: 2,
      speedUpType: "average"
    }

    this.changeBackend = this.changeBackend.bind(this)
    this.changeMachine = this.changeMachine.bind(this)
    this.changeBenchmark = this.changeBenchmark.bind(this)
    this.changeDataset = this.changeDataset.bind(this)
    this.changeGraphType = this.changeGraphType.bind(this)
    this.onSpeedupMaxChange = this.onSpeedupMaxChange.bind(this)
    this.onChangeSpeedUpType = this.onChangeSpeedUpType.bind(this)
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

  onChangeSpeedUpType(value) {
    this.setState({
      speedUpType: value ? 'minimum' : 'average'
    })
  }

  onSpeedupMaxChange(speedUpMax) {
    this.setState({
      speedUpMax
    })
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

  changeGraphType(value) {
    this.setState({
      graphType: value ? 'speedup' : 'absolute'
    })
  }

  changeBenchmark(benchmark) {
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
      commits,
      graphType,
      speedUpMax
    } = this.state

    if (skeleton === null)
      return <div>Loading</div>

    this.downloadData()

    const backends = skeleton !== null ? Object.keys(skeleton) : []
    const machines = backend !== null && skeleton[backend] !== null ? Object.keys(skeleton[backend]) : []
    const benchmarkKeys = benchmarks !== null ? Object.keys(benchmarks) : []
    const datasets = ( benchmarks !== null && benchmark !== null ) ? benchmarks[benchmark] : []
    let x = []
    let y = []
    let data = []

    if (dataset !== null) {
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
      refinedData = refinedData.map(e => [e.date, e.avg])
      data = refinedData
      const unzipped = _.unzip(refinedData)
      x = unzipped[0]
      y = unzipped[1]
      
      if (graphType === 'speedup' && y !== undefined) {
        const minY = Math.min(...y)
        y = y.map(e => (e / minY).toFixed(2))
      }
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
                <Col span={3}>
                  <span style={{marginRight: "5px"}}>
                    Absolute
                  </span>
                  <Switch defaultChecked onChange={this.changeGraphType} checked={this.state.graphType === "speedup"} />
                  <span style={{marginLeft: "5px"}}>
                    Speedup
                  </span>
                </Col>
                <Col span={9}>
                  { this.state.graphType === "speedup" &&
                    <div>
                      <span style={{position: "relative", top: "-10px", marginRight: "5px"}}>
                        Speedup max: 
                      </span>
                      <Slider
                        style={{
                          width: "150px",
                          display: "inline-block",
                          marginTop: "5px"
                        }}
                        min={2}
                        max={10}
                        onChange={this.onSpeedupMaxChange}
                        value={speedUpMax}
                      />
                      <InputNumber
                        min={2}
                        max={10}
                        style={{ 
                          marginLeft: 16,
                          position: "relative",
                          top: "-10px",
                          width: "60px"
                        }}
                        value={speedUpMax}
                        onChange={this.onSpeedupMaxChange}
                      />
                      {/*
                      <div
                        style={{
                            clear: "both",
                            position: "relative",
                            top: "-10px",
                            marginLeft: "10px",
                            display: "inline-block"
                        }}
                      >
                          <span style={{marginRight: "5px"}}>
                            Average
                          </span>
                          <Switch
                            defaultChecked
                            onChange={this.onChangeSpeedUpType}
                            checked={this.state.speedUpType === "minimum"}
                          />
                          <span style={{marginLeft: "5px"}}>
                            Minimum
                          </span>
                      </div>
                      */}
                    </div>
                  }
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={2}>
                  { backends !== null &&
                    <Select
                      onChange={this.changeBackend}
                      style={{ width: "100%", display: "block" }}
                      showSearch={true}
                      autoFocus={true}
                      value={backend !== null ? backend : undefined}
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
                  { backend !== null && skeleton[backend] !== null &&
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
                  { machine !== null && benchmarks !== null &&
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
                  { benchmark !== null && datasets !== null &&
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
              <Graph
                dataset={dataset}
                data={data}
                backend={backend}
                speedUpMax={speedUpMax}
                graphType={graphType}
                benchmark={benchmark}
                machine={machine}
                x={x}
                y={y}
              />
            </Content>
          </Layout>
        </Layout>
      </div>
    )
  }
}

export default App
