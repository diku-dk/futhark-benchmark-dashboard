import React, { Component } from 'react'
import {
  Card,
  Spin,
  Col,
  Row
} from 'antd'
import Commit from '../modules/Commit'
import _ from 'lodash'
import Comparison from './Comparison'
import * as actions from '../modules/actions'
import * as compareActions from './actions'
import {connect} from 'react-redux'

class Compare extends Component {
  constructor(props) {
    super(props)
    this.state = {
      queue: {}
    }
  }

  componentDidMount() {
    const {fetchMetadata} = this.props
    const promise = fetchMetadata()

    if ( promise.then !== undefined  ) {
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
    const {queue} = this.state

    for ( let pathIndex in selected ) {
      const path = selected[pathIndex]
      const {backend, machine} = path

      if ( ! _.get(queue, [backend, machine]) ) {
        const promise = fetchBackendMachine(backend, machine)

        if ( promise.then !== undefined  ) {
          _.set(queue, [backend, machine], true)
          this.setState({
            queue
          })
          promise.then(() => {
            _.set(queue, [backend, machine], false)
            this.setState({
              queue
            })
          })
        }
      }
    }
  }

  render() {
    const {
      data: {
        skeleton,
        commits
      },
      compare: {
        selected
      },
      changeBackend,
      changeMachine,
      changeCommit
    } = this.props

    if (skeleton === null || commits === null || selected == null) {
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
            />
          ))}
        </Card>

        { selected.length === 2 && selected.every(path => path.machine !== null && path.backend !== null && path.commit !== null) &&
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
