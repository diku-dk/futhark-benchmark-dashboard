import React, { Component } from 'react'
import {
  Card,
  Spin,
  Col,
  Row,
  Divider
} from 'antd'
import Commit from '../modules/Commit'
import Comparison from './Comparison'
import * as actions from '../modules/actions'
import * as compareActions from './actions'
import { connect } from 'react-redux'
import queryString from 'querystring'

class Compare extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount() {
    const {
      fetchMetadata,
      changeSelected
    } = this.props
    const promise = fetchMetadata()

    const params = queryString.parse(this.props.routing.location.search.replace(/^\?/, ''))

    if (params && params.selected != null) {
      try {
        var json = JSON.parse(params.selected)
        if (Array.isArray(json)) {
          let selected = []
          for (let selection of json) {
            if (Array.isArray(selection)) {
              const [backend, machine, commit] = selection
              selected.push({
                backend,
                machine,
                commit
              })
            }
          }

          if (selected.length > 0) {
            changeSelected(selected)
          }
        }
      } catch (e) {
      }
    }

    if (promise.then != null) {
      promise.then((response) => {
        this.downloadData()
      })
    }
  }

  componentDidUpdate() {
    this.downloadData()
  }

  downloadData() {
    const {
      compare: {
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

  render() {
    const {
      data: {
        skeleton,
        commits,
        loading
      },
      compare: {
        selected
      },
      changeBackend,
      changeMachine,
      changeCommit,
      changeFile
    } = this.props

    if (skeleton == null || commits == null || selected == null || loading.length > 0) {
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
          {(selected).map((path, index) => (
            <Commit
              count={selected.length}
              key={index}
              skeleton={skeleton}
              path={path}
              index={index}
              changeBackend={changeBackend}
              changeMachine={changeMachine}
              changeCommit={changeCommit}
              changeFile={changeFile}
            />
          ))}
        </Card>

        <Divider />

        { selected.length === 2 && selected.every(path => (path.machine != null && path.backend != null && path.commit != null) || path.data != null) &&
          <Card>
            <Comparison
              selected={selected}
              skeleton={skeleton}
            />
          </Card>
        }
      </div>
    )
  }
}

export default connect(
  state => state, {...actions, ...compareActions}
)(Compare)
