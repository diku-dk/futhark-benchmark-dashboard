import React, { Component } from 'react'
import { Table } from 'antd';
import _ from 'lodash'
import { Link } from "react-router-dom"
const { Column } = Table;

function compare(a,b) {
  if (a.diff < b.diff)
    return -1;
  if (a.diff > b.diff)
    return 1;
  return 0;
}

export default class Comparison extends Component {
  render() {
    const {
      skeleton,
      selected
    } = this.props;

    const first = selected[0]
    const {
      machine: firstMachineKey,
      backend: firstBackendKey,
      commit: firstCommitKey,
      data: firstCommitData
    } = first
    let firstCommit = null
    if (firstCommitData) {
      firstCommit = firstCommitData
    } else {
      firstCommit = skeleton[firstBackendKey][firstMachineKey][firstCommitKey]
    }

    const second = selected[1]
    let secondCommit = null
    const {
      machine: secondMachineKey,
      backend: secondBackendKey,
      commit: secondCommitKey,
      data: secondCommitData
    } = second
    if (secondCommitData) {
      secondCommit = secondCommitData
    } else {
      secondCommit = skeleton[secondBackendKey][secondMachineKey][secondCommitKey]
    }

    let scores = []

    for (const benchmarkKey in firstCommit) {
      const benchmark = firstCommit[benchmarkKey]

      for (const datasetKey in benchmark['datasets']) {
        const dataset = benchmark['datasets'][datasetKey]

        if (_.has(secondCommit, [benchmarkKey, 'datasets', datasetKey])) {
          const secondDataset = _.get(secondCommit, [benchmarkKey, 'datasets', datasetKey])
          const diff = (secondDataset['avg'] - dataset['avg']) / secondDataset['avg'] * 100

          if (Math.abs(diff) > 1) {
            scores.push({
              diff,
              benchmark: benchmarkKey,
              dataset: datasetKey,
              benchmark: benchmarkKey,
              dataset: datasetKey,
              firstMachine: firstMachineKey,
              secondMachine: secondMachineKey,
              firstBackend: firstBackendKey,
              secondBackend: secondBackendKey,
              key: [benchmarkKey, datasetKey].join("-")
            })
          }
        }
      }
    }

    const scoresSorted = scores.sort(compare).reverse()

    return (
      <div>
        <Table
          dataSource={scoresSorted}
          pagination={false}
          bordered
          style={{maxWidth: "1100px"}}
          rowClassName={(record) => record.diff > 10 ? 'row-green' : (record.diff < -10) ? 'row-red' : ''}
        >
          <Column
            title="Benchmark"
            render={(text, record) => (
              <Link to={`/visualize?selected=${JSON.stringify([['230,25,75',record.firstBackend, record.firstMachine, record.benchmark, record.dataset], ['60,180,75',record.secondBackend, record.secondMachine, record.benchmark, record.dataset]])}&xLeft=0&xRight=100`}>
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
              <Link to={`/visualize?selected=${JSON.stringify([['230,25,75',record.firstBackend, record.firstMachine, record.benchmark, record.dataset], ['60,180,75',record.secondBackend, record.secondMachine, record.benchmark, record.dataset]])}&xLeft=0&xRight=100`}>
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
      </div>
    )
  }
}
