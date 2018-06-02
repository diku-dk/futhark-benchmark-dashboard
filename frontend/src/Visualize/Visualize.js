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
import D3Graph from '../Graph/D3Graph'
import _ from 'lodash'
import {connect} from 'react-redux'
import * as actions from '../modules/actions'
import * as visualizeActions from './actions'
import {
  isDesktop,
  isMobile,
  isTablet
} from '../modules/utils'

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
      changeSlowdownMax,
      changeGraphZoom
    } = this.props
    const promise = fetchMetadata()

    const url = new URL(window.location)

    if (url != null) {
      if (url.searchParams.get('graphType') != null) {
        changeGraphType((url.searchParams.get('graphType') === 'slowdown'))
        if (url.searchParams.get('slowdownMax') != null) {
          let value = parseInt(url.searchParams.get('slowdownMax'), 10)
          changeSlowdownMax(value)
        }
      }

      if (url.searchParams.get('xLeft') != null || url.searchParams.get('xRight') != null) {
        let xLeft = url.searchParams.get('xLeft') || 0
        let xRight = url.searchParams.get('xRight') || 100
        changeGraphZoom(parseInt(xLeft, 10), parseInt(xRight, 10))
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
              } else if (typeof selection === 'object') {
                const {backend, machine, benchmark, dataset} = selection
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
    const {
      removePath,
      changeSelected,
      visualize: {
        selected
      },
      data: {
        benchmarks
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

  renderPaths() {
    const {
      visualize: {
        selected
      },
      data: {
        colors,
        benchmarks,
        skeleton
      },
      removePath,
      addPath,
      changeBackend,
      changeBenchmark,
      changeMachine,
      changeDataset
    } = this.props

    return (
      <div>
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
      </div>
    )
  }

  render() {
    const {
      visualize: {
        graphType,
        slowdownMax,
        selected,
        xLeft,
        xRight
      },
      data: {
        colors,
        skeleton,
        commits,
        loading
      },
      changeGraphType,
      changeSlowdownMax,
      changeGraphZoom
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

    const slowdownStyle = (isDesktop()) ? {
      position: "relative", 
      top: "-10px", 
      marginRight: "5px"
    } : {
      marginTop: "10px",
      position: "relative"
    }

    const slowdownInputStyle = (isDesktop()) ? {
      marginLeft: 16,
      position: "relative",
      top: "-10px",
      width: "60px"
    } : {
      position: "relative",
      top: "0px",
      width: "100%"
    }

    return (
      <div style={{width: "100vw", "overflow": "hidden"}}>
        <Card style={{marginBottom: "10px"}}>
          <Row gutter={16} style={{marginBottom: "10px"}}>
            <Col xl= {5} xxl={3} md={6} sm={24}>
              <span style={{marginRight: "5px"}}>
                Absolute
              </span>
              <Switch defaultChecked onChange={changeGraphType} checked={graphType === "slowdown"} />
              <span style={{marginLeft: "5px"}}>
                Slowdown
              </span>
            </Col>
            <Col xl={12} xxl={9} md={12} sm={24}>
              {graphType === "slowdown" &&
                <div>
                  <span style={slowdownStyle}>
                    Slowdown max:
                  </span>
                  <Slider
                    style={{
                      width: (isDesktop()) ? "150px" : "100%",
                      display: (isDesktop()) ? "inline-block" : "block",
                      marginTop: "5px"
                    }}
                    min={1}
                    max={15}
                    onChange={changeSlowdownMax}
                    value={slowdownMax}
                  />
                  <InputNumber
                    min={1}
                    max={40}
                    style={slowdownInputStyle}
                    value={slowdownMax}
                    onChange={changeSlowdownMax}
                  />
                </div>
              }
            </Col>
          </Row>
        </Card>

        { isDesktop() &&
          <Card style={{marginBottom: "10px"}}>
            {this.renderPaths()}
          </Card>
        }

        { (isMobile() || isTablet()) && this.renderPaths()}

        <Card>
          <D3Graph
            data={skeleton}
            dates={commits}
            selected={selected}
            colors={colors}
            yMax={slowdownMax}
            type={graphType}
            changeGraphZoom={changeGraphZoom}
            xLeft={xLeft}
            xRight={xRight}
          />
        </Card>
      </div>
    )
  }
}

export default connect(
  state => state, {...actions, ...visualizeActions}
)(Visualize)
