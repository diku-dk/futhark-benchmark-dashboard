import React, { Component } from 'react'
import { Table, Spin, List } from 'antd'
import { connect } from 'react-redux'
import { Link } from "react-router-dom"
import * as actions from './actions'
import {
  isMobile,
  isTablet
} from '../modules/utils'
const { Column } = Table;

const rowClass = (record) => {
  const changeThreshold = 10

  if (record.diff > changeThreshold) {
    return 'row-green'
  } else if (record.diff < -changeThreshold) {
    return 'row-red'
  }

  return ''
}

const DesktopTable = ({scores}) => {
  return (
    <Table
      dataSource={scores}
      pagination={false}
      bordered
      style={{maxWidth: "1100px"}}
      rowClassName={(record) => rowClass(record)}
    >
      <Column
        title="Backend"
        dataIndex="backend"
        key="backend"
        render={(text, record) => (
          <Link to={`/visualize?selected=${JSON.stringify([['230,25,75',record.backend, record.machine, record.benchmark, record.dataset]])}&xLeft=0&xRight=100`}>
            {text}
          </Link>
        )}
      />
      <Column
        title="Machine"
        dataIndex="machine"
        key="machine"
        render={(text, record) => (
          <Link to={`/visualize?selected=${JSON.stringify([['230,25,75',record.backend, record.machine, record.benchmark, record.dataset]])}&xLeft=0&xRight=100`}>
            {text}
          </Link>
        )}
      />
      <Column
        title="Benchmark"
        render={(text, record) => (
          <Link to={`/visualize?selected=${JSON.stringify([['230,25,75',record.backend, record.machine, record.benchmark, record.dataset]])}&xLeft=0&xRight=100`}>
            {record.benchmark.replace("futhark-benchmarks/", "")}
          </Link>
        )}
        key="benchmark"
      />
      <Column
        title="Dataset"
        dataIndex="dataset"
        key="dataset"
        render={(text, record) => (
          <Link to={`/visualize?selected=${JSON.stringify([['230,25,75',record.backend, record.machine, record.benchmark, record.dataset]])}&xLeft=0&xRight=100`}>
            {text}
          </Link>
        )}
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
  )
}

const MobileTable = ({scores}) => {
  const ExpandedRow = ({record}) => (
    <div>
      <List>
        <List.Item>
          <List.Item.Meta
            title="Backend"
            description={record.backend}
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            title="Machine"
            description={record.machine}
          />
        </List.Item>
      </List>
    </div>
  );

  return (
    <Table
      dataSource={scores}
      pagination={false}
      bordered
      rowClassName={(record) => rowClass(record)}
      expandedRowRender={record => <ExpandedRow record={record} />}
    >
      <Column
        title="Benchmark"
        width={30}
        render={(text, record) => (
          <Link to={`/visualize?selected=${JSON.stringify([['230,25,75',record.backend, record.machine, record.benchmark, record.dataset]])}&xLeft=0&xRight=100`}>
            {record.benchmark.replace("futhark-benchmarks/", "")}
          </Link>
        )}
        key="benchmark"
      />
      <Column
        title="Dataset"
        dataIndex="dataset"
        key="dataset"
        width={30}
        render={(text, record) => (
          <Link to={`/visualize?selected=${JSON.stringify([['230,25,75',record.backend, record.machine, record.benchmark, record.dataset]])}&xLeft=0&xRight=100`}>
            {text}
          </Link>
        )}
      />
      <Column
        title="%"
        key="diff"
        width="40px"
        render={(text, record) => (
          <span>
            {Math.floor(record.diff)} %
          </span>
        )}
      />
    </Table>
  )
}

class Home extends Component {
  componentDidMount() {
    const {fetchDashboard} = this.props 
    fetchDashboard()
  }

  renderTop() {
    const {
      home: {
        topScores
      }
    } = this.props

    if (isMobile() || isTablet()) {
      return <MobileTable scores={topScores} />
    } else {
      return <DesktopTable scores={topScores} />
    }
  }

  renderBottom() {
    const {
      home: {
        bottomScores
      }
    } = this.props

    if (isMobile() || isTablet()) {
      return <MobileTable scores={bottomScores} />
    } else {
      return <DesktopTable scores={bottomScores} />
    }
  }

  render() {
    const {home: {loading}} = this.props

    return (
      <Spin
        spinning={loading}
        size="large"
      >
        <h1>Improvements</h1>
        {this.renderTop()}

        <h1>Regressions</h1>
        {this.renderBottom()}
      </Spin>
    )
  }
}

export default connect(
  state => state, {...actions}
)(Home)
