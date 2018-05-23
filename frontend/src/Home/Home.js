import React, { Component } from 'react'
import { Table, Spin } from 'antd'
import {connect} from 'react-redux' 
import * as actions from './actions'
const { Column } = Table;

class Home extends Component {
  componentDidMount() {
    const {fetchDashboard} = this.props 
    fetchDashboard()
  }

  render() {
    const {home: {topScores, bottomScores, loading}} = this.props

    return (
      <Spin
        spinning={loading}
        size="large"
      >
        <h1>Improvements</h1>
        <Table
          dataSource={topScores}
          pagination={false}
          bordered
          style={{maxWidth: "1100px"}}
          rowClassName={(record) => record.diff > 10 ? 'row-green' : (record.diff < -10) ? 'row-red' : ''}
        >
          <Column
            title="Backend"
            dataIndex="backend"
            key="backend"
          />
          <Column
            title="Machine"
            dataIndex="machine"
            key="machine"
          />
          <Column
            title="Benchmark"
            render={(text, record) => (
              <span>
                {record.benchmark.replace("futhark-benchmarks/", "")}
              </span>
            )}
            key="benchmark"
          />
          <Column
            title="Dataset"
            dataIndex="dataset"
            key="dataset"
          />
          <Column
            title="Difference (%)"
            key="diff"
            render={(text, record) => (
              <span>
                {Math.floor(record.diff)} %
              </span>
            )}
          />
        </Table>

        <h1>Regressions</h1>
        <Table
          dataSource={bottomScores}
          pagination={false}
          bordered
          rowClassName={(record) => record.diff > 10 ? 'row-green' : (record.diff < -10) ? 'row-red' : ''}
          style={{maxWidth: "1100px"}}
        >
          <Column
            title="Backend"
            dataIndex="backend"
            key="backend"
          />
          <Column
            title="Machine"
            dataIndex="machine"
            key="machine"
          />
          <Column
            title="Benchmark"
            render={(text, record) => (
              <span>
                {record.benchmark.replace("futhark-benchmarks/", "")}
              </span>
            )}
            key="benchmark"
          />
          <Column
            title="Dataset"
            dataIndex="dataset"
            key="dataset"
          />
          <Column
            title="Difference (%)"
            key="diff"
            render={(text, record) => (
              <span>
                {Math.floor(record.diff)} %
              </span>
            )}
          />
        </Table>
      </Spin>
    )
  }
}

export default connect(
  state => state, {...actions}
)(Home)
