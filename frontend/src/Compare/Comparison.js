import React, { Component } from 'react'
import { Table } from 'antd';
import _ from 'lodash'
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
      commit: firstCommitKey
    } = first
    const firstCommit = skeleton[firstBackendKey][firstMachineKey][firstCommitKey]
    const second = selected[1]
    const {
      machine: secondMachineKey,
      backend: secondBackendKey,
      commit: secondCommitKey
    } = second
    const secondCommit = skeleton[secondBackendKey][secondMachineKey][secondCommitKey]

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
