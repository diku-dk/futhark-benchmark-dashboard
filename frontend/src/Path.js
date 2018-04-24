import React, { Component } from 'react'
import {
  Select,
  Row,
  Col,
  Button
} from 'antd'
const Option = Select.Option

class Path extends Component {
  render() {
    const {
      benchmarks,
      skeleton,
      path,
      count,
      index,
      changeBackend,
      changeMachine,
      changeBenchmark,
      changeDataset,
      onAddPath,
      onRemovePath
    } = this.props

    const {
      machine,
      backend,
      benchmark,
      dataset
    } = path

    const machines = backend !== null && skeleton[backend] !== null ? Object.keys(skeleton[backend]) : []
    const backends = skeleton !== null ? Object.keys(skeleton) : []
    const benchmarkKeys = benchmarks !== null ? Object.keys(benchmarks) : []
    const datasets = ( benchmarks !== null && benchmark !== null ) ? benchmarks[benchmark] : []
    const hasPlus = index === (count - 1) && benchmark !== null && datasets !== null && dataset !== null

    return (
      <Row gutter={16} style={{marginBottom: "10px"}}>
        <Col span={2}>
          { backends !== null &&
            <Select
              onChange={(value) => changeBackend(index, value)}
              style={{ width: "100%", display: "block" }}
              showSearch={true}
              autoFocus={true}
              value={backend !== null ? backend : undefined}
            >
              {backends.map(backend => (
                <Option
                  value={backend}
                  key={backend}
                >
                  {backend}
                </Option>
              ))}
            </Select>
          }
        </Col>
        <Col span={2}>
          { backend !== null && skeleton[backend] !== null &&
            <Select
              style={{ width: "100%", display: "block" }}
              onChange={(value) => changeMachine(index, value)}
              showSearch={true}
              autoFocus={true}
              value={machine != null ? machine : undefined}
            >
              {machines.map(machine => (
                <Option
                  key={machine}
                  value={machine}
                >
                  {machine}
                </Option>
              ))}
            </Select>
          }
        </Col>
        <Col span={4}>
          { machine !== null && benchmarks !== null &&
            <Select
              style={{ width: "100%", display: "block" }}
              onChange={(value) => changeBenchmark(index, value)}
              showSearch={true}
              autoFocus={true}
              value={benchmark != null ? benchmark : undefined}
            >
              {benchmarkKeys.map(benchmark => (
                <Option
                  key={benchmark}
                  value={benchmark}
                >
                  {benchmark.replace("futhark-benchmarks/", "")}
                </Option>
              ))}
            </Select>
          }
        </Col>
        <Col span={4}>
          { benchmark !== null && datasets !== null &&
            <Select
              style={{ width: "100%", display: "block" }}
              onChange={(value) => changeDataset(index, value)}
              showSearch={true}
              autoFocus={true}
              value={dataset != null ? dataset : undefined}
            >
              {datasets.map(dataset => (
                <Option
                  key={dataset}
                  value={dataset}
                >
                  {dataset}
                </Option>
              ))}
            </Select>
          }
        </Col>
        <Col span={2}>
          { hasPlus &&
              <Button type="primary" shape="circle" icon="plus" onClick={onAddPath} />
          }
          { (index > 0 || (index === 0 && count > 1)) &&
            <Button shape="circle" icon="minus" onClick={() => onRemovePath(index)} style={{marginLeft: hasPlus ? "5px" : "0px"}} />
          }
        </Col>
      </Row>
    );
  }
}

export default Path
