import React, { Component } from 'react'
import axios from 'axios'
import { Table } from 'antd';
const { Column } = Table;

class Home extends Component {
  constructor(props) {
    super(props)

    this.state = {
      topScores: [],
      bottomScores: []
    }
  }

  componentDidMount() {
    axios('http://localhost:8080/dashboard.json', {
      mode: "cors"
    })
    .then(response => {
      const parsed = response.data
      this.setState({
        topScores: parsed.topScores,
        bottomScores: parsed.bottomScores
      })
    })
    .catch(console.error)
  }

  render() {
    const {topScores, bottomScores} = this.state;

    return (
      <div>
        <h1>Improvements</h1>
        <Table
          dataSource={topScores}
          pagination={false}
          bordered
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

        <h1>Regressions</h1>
        <Table
          dataSource={bottomScores}
          pagination={false}
          bordered
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
      </div>
    )
  }
}

export default Home
