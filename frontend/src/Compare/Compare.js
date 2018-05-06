import React, { Component } from 'react'
import {
  Card,
  Spin,
  Col,
  Row
} from 'antd'
import Commit from '../Commit'
import axios from 'axios'
import _ from 'lodash'
import Comparison from './Comparison'

class Compare extends Component {
  constructor(props) {
    super(props)
    this.state = {
      skeleton: null,
      benchmarks: null,
      selected: [
        {
          backend: 'opencl',
          machine: 'GTX780',
          commit: '0397438e8fc6cd2e5549a9d883d1e5a5c11110f7'
        },
        {
          backend: 'opencl',
          machine: 'GTX780',
          commit: '009795e2ccdf19374113efe74586a472cba40581'
        }
      ],
      commits: [],
      sortedCommitKeys: []
    }

    this.changeBackend = this.changeBackend.bind(this)
    this.changeMachine = this.changeMachine.bind(this)
    this.changeCommit = this.changeCommit.bind(this)
    this.onRemovePath = this.onRemovePath.bind(this)
    this.onAddPath = this.onAddPath.bind(this)
  }

  componentDidMount() {
    axios(`${process.env.REACT_APP_DATA_URL || 'http://localhost:8080'}/metadata.json`, {
      mode: "cors"
    })
    .then(response => {
      const parsed = response.data
      const {commits, skeleton} = parsed
      const sortedCommitKeys = Object.keys(commits).sort((a, b) => {
        return new Date(commits[a]) - new Date(commits[b])
      })
      this.setState({
        skeleton: skeleton,
        commits: commits,
        sortedCommitKeys: sortedCommitKeys
      })
      this.downloadData()
    })
    .catch(console.error)
  }

  componentWillUpdate() {
    this.downloadData()
  }

  onAddPath() {
    const {selected} = this.state

    selected.push({
      backend: null,
      machine: null,
      commit: null
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

  changeCommit(index, commit) {
    const {selected, commits, skeleton} = this.state
    const path = selected[index]
    const {backend, machine} = path

    if ( ! (commit in commits) || skeleton[backend][machine][commit] === null ) {
      selected[index] = _.merge(selected[index], {
        commit: null
      })
      return this.setState(selected)
    }

    selected[index] = _.merge(selected[index], {
      commit
    })
    this.setState(selected)
  }

  changeMachine(index, machine) {
    const {selected} = this.state
    selected[index] = _.merge(selected[index], {
      machine
    })
    this.setState(selected)
  }

  changeBackend(index, backend) {
    const {selected} = this.state
    selected[index] = _.merge(selected[index], {
      backend
    })
    this.setState(selected)
  }

  downloadData() {
    const {skeleton, selected} = this.state

    for ( let pathIndex in selected ) {
      const path = selected[pathIndex]
      const {backend, machine} = path
      if (
        skeleton !== null &&
        backend !== null &&
        machine !== null &&
        _.get(skeleton, [backend, machine]) &&
        Object.keys(skeleton[backend][machine]).length === 0
      ) {
        axios(`${process.env.REACT_APP_DATA_URL || 'http://localhost:8080'}/data-split/${backend}/${machine}.json`, {
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
      skeleton,
      commits,
      selected
    } = this.state

    if (skeleton === null || commits === null) {
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
              changeBackend={this.changeBackend}
              changeMachine={this.changeMachine}
              changeCommit={this.changeCommit}
              onRemovePath={this.onRemovePath}
              onAddPath={this.onAddPath}
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

export default Compare;
