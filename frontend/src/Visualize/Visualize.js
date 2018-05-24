import React, { Component } from 'react'
import {
  Row,
  Col,
  Switch,
  Slider,
  InputNumber,
  Spin,
  Card
} from 'antd'
import Path from '../modules/Path'
import Graph from '../Graph/Graph'
import _ from 'lodash'
import {connect} from 'react-redux'
import * as actions from '../modules/actions'
import * as visualizeActions from './actions'

class Visualize extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }

    this.addAllDatasets = this.addAllDatasets.bind(this)
  }

  componentDidMount() {
    const {
      fetchMetadata,
      changeSelected,
      changeGraphType,
      changeSpeedMax
    } = this.props
    const promise = fetchMetadata()

    const url = new URL(window.location)

    if (url != null) {
      if (url.searchParams.get('speedup') != null) {
        changeGraphType(true)
        let value = parseInt(url.searchParams.get('speedup'), 10)
        changeSpeedMax(value)
      }

      if (url.searchParams.get('selected') != null) {
        try {
          var json = JSON.parse(url.searchParams.get('selected'))
          if (Array.isArray(json)) {
            let selected = []
            for (let selection of json) {
              if (Array.isArray(selection)) {
                const [backend, machine, benchmark, dataset] = selection
                selected.push({
                  backend,
                  machine,
                  benchmark,
                  dataset
                })
              }
            }

            if (selected.length > 0) {
              changeSelected(selected)
            }
          }
        } catch ( e ) {
        }
      }
    }

    if (promise.then != null) {
      promise.then((response) => {
        this.downloadData()
      })
    }
  }

  addAllDatasets(path, index) {
    const {benchmarks} = this.state;
    const {
      removePath,
      changeSelected,
      visualize: {
        selected
      }
    } = this.props

    const selectionExists = toCheck => selected.find(element => _.isEqual(Object.values(element), Object.values(toCheck)) )

    if (benchmarks[path.benchmark] != null) {
      for (let dataset of benchmarks[path.benchmark]) {
        if (path.dataset !== dataset && ! selectionExists(Object.assign({}, path, {dataset}))) {
          selected.push(Object.assign({}, path, {dataset}))
        }
      }

      if (path.dataset == null) {
        removePath(index)
      }

      changeSelected(selected)
    }
  }

  downloadData() {
    const {
      visualize: {
        selected
      },
      fetchBackendMachine
    } = this.props

    for (let pathIndex in selected) {
      const path = selected[pathIndex]
      const {backend, machine} = path

      fetchBackendMachine(backend, machine)
    }
  }

  componentDidUpdate() {
    this.downloadData()
  }

  render() {
    const {
      visualize: {
        graphType,
        speedUpMax,
        selected
      },
      data: {
        colors,
        benchmarks,
        skeleton,
        commits,
        loading
      },
      removePath,
      addPath,
      changeGraphType,
      changeSpeedMax,
      changeBackend,
      changeBenchmark,
      changeMachine,
      changeDataset
    } = this.props

    if (skeleton == null || selected == null || loading.length > 0) {
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

    return (
      <div>
        <Card style={{marginBottom: "10px"}}>
          <Row gutter={16} style={{marginBottom: "10px"}}>
            <Col span={3}>
              <span style={{marginRight: "5px"}}>
                Absolute
              </span>
              <Switch defaultChecked onChange={changeGraphType} checked={graphType === "speedup"} />
              <span style={{marginLeft: "5px"}}>
                Speedup
              </span>
            </Col>
            <Col span={9}>
              {graphType === "speedup" &&
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
                    onChange={changeSpeedMax}
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
                    onChange={changeSpeedMax}
                  />
                </div>
              }
            </Col>
          </Row>
        </Card>

        <Card style={{marginBottom: "10px"}}>
          {selected.map((path, index) => (
            <Path
              key={index}
              colors={colors}
              benchmarks={benchmarks}
              path={path}
              index={index}
              count={selected.length}
              skeleton={skeleton}
              changeBackend={changeBackend}
              changeMachine={changeMachine}
              changeBenchmark={changeBenchmark}
              changeDataset={changeDataset}
              onAddPath={addPath}
              onRemovePath={removePath}
              addAllDatasets={this.addAllDatasets}
            />
          ))}
        </Card>

        <Card>
          <Graph
            colors={colors}
            commits={commits}
            skeleton={skeleton}
            selected={selected}
            speedUpMax={speedUpMax}
            graphType={graphType}
          />
        </Card>
      </div>
    )
  }
}

export default connect(
  state => state, {...actions, ...visualizeActions}
)(Visualize)
