import React, { Component } from 'react'
import { 
  Layout,
  Menu,
  Row,
  Col,
  Switch,
  Slider,
  InputNumber,
  Spin
} from 'antd'
import Path from './Path'
import Graph from './Graph/Graph'
import './App.css'
import axios from 'axios'
import _ from 'lodash'
const { Header, Content } = Layout

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      skeleton: null,
      benchmarks: null,
      selected: [
        {
          backend: 'opencl',
          machine: 'GTX780',
          benchmark: "futhark-benchmarks/misc/radix_sort/radix_sort.fut",
          dataset: 'data/radix_sort_100.in'
        },
        {
          backend: 'opencl',
          machine: 'GTX780',
          benchmark: "futhark-benchmarks/misc/radix_sort/radix_sort.fut",
          dataset: '#0'
        }
      ],
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
    this.onAddPath = this.onAddPath.bind(this)
    this.onRemovePath = this.onRemovePath.bind(this)
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
  
  changeGraphType(value) {
    this.setState({
      graphType: value ? 'speedup' : 'absolute'
    })
  }

  onAddPath() {
    const {selected} = this.state

    selected.push({
      backend: null,
      machine: null,
      benchmark: null,
      dataset: null
    })
    this.setState({
      selected
    })
  }

  onRemovePath(index) {
    const {selected} = this.state

    selected.splice(index, 1)
    this.setState({
      selected
    })
  }

  changeMachine(index, machine) {
    const {selected} = this.state
    selected[index] = _.merge(selected[index], {
      benchmark: null,
      dataset: null,
      machine
    })
    this.setState(selected)
  }

  changeDataset(index, dataset) {
    const {selected} = this.state
    selected[index] = _.merge(selected[index], {
      dataset
    })
    this.setState(selected)
  }

  changeBenchmark(index, benchmark) {
    const {selected} = this.state
    selected[index] = _.merge(selected[index], {
      dataset: null,
      benchmark
    })
    this.setState(selected)
  }

  changeBackend(index, backend) {
    const {selected} = this.state
    selected[index] = _.merge(selected[index], {
      machine: null,
      benchmark: null,
      dataset: null,
      backend
    })
    this.setState(selected)
  }

  downloadData() {
    const {selected, skeleton} = this.state

    for ( let path of selected ) {
      const {backend, machine} = path
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
  }

  render() {
    const {
      benchmarks,
      skeleton,
      commits,
      selected,
      graphType,
      speedUpMax
    } = this.state

    if (skeleton === null) {
      return (
        <div>
          <Row>
            <Col span={4} offset={10} style={{marginTop: "calc(50vh - 20px)"}}>
              <div style={{margin: "0 auto", width: "37px"}}>
                <Spin size="large" />
              </div>
            </Col>
          </Row>
        </div>
      )
    }

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

    this.downloadData()

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
              <Row gutter={16} style={{marginBottom: "10px"}}>
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
                    </div>
                  }
                </Col>
              </Row>

              { selected.map((path, index) => (
                <Path
                  colors={colors}
                  benchmarks={benchmarks}
                  path={path}
                  key={index}
                  index={index}
                  count={selected.length}
                  skeleton={skeleton}
                  changeBackend={this.changeBackend}
                  changeMachine={this.changeMachine}
                  changeBenchmark={this.changeBenchmark}
                  changeDataset={this.changeDataset}
                  onAddPath={this.onAddPath}
                  onRemovePath={this.onRemovePath}
                />
              ))}

              <Graph
                colors={colors}
                commits={commits}
                skeleton={skeleton}
                selected={selected}
                speedUpMax={speedUpMax}
                graphType={graphType}
              />
            </Content>
          </Layout>
        </Layout>
      </div>
    )
  }
}

export default App
