import React, { Component } from 'react'
import {
  Select,
  Row,
  Col,
  Button,
  Tooltip
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
      onRemovePath,
      addAllDatasets,
      colors
    } = this.props

    const {
      machine,
      backend,
      benchmark,
      dataset
    } = path

    const machines = backend != null && skeleton[backend] != null ? Object.keys(skeleton[backend]) : []
    const backends = skeleton != null ? Object.keys(skeleton) : []
    const benchmarkKeys = benchmarks != null ? Object.keys(benchmarks) : []
    const datasets = (benchmarks != null && benchmark != null ) ? benchmarks[benchmark] : []
    const hasPlus = index === (count - 1) && benchmark != null && datasets != null && dataset != null

    return (
      <Row gutter={16} style={{marginBottom: "10px"}}>
        <Col span={1}>
          <span style={{backgroundColor: `rgb(${colors[index]})`, width: "40px", height: "32px", display: "block"}}>
          </span>
        </Col>
        <Col span={2}>
          {backends != null &&
            <Select
              onChange={(value) => changeBackend(index, value)}
              style={{ width: "100%", display: "block" }}
              showSearch={true}
              autoFocus={true}
              value={backend != null ? backend : undefined}
            >
              {backends.map(backend => (
                <Option
                  value={backend}
                  key={'path-' + backend}
                >
                  {backend}
                </Option>
              ))}
            </Select>
          }
        </Col>
        <Col span={2}>
          {backend != null && skeleton[backend] != null &&
            <Select
              style={{ width: "100%", display: "block" }}
              onChange={(value) => changeMachine(index, value)}
              showSearch={true}
              autoFocus={true}
              value={machine}
            >
              {machines.map(machine => (
                <Option
                  value={machine}
                  key={'path-' + machine}
                >
                  {machine}
                </Option>
              ))}
            </Select>
          }
        </Col>
        <Col span={4}>
          {machine != null && benchmarks != null &&
            <Select
              style={{ width: "100%", display: "block" }}
              onChange={(value) => changeBenchmark(index, value)}
              showSearch={true}
              autoFocus={true}
              value={benchmark}
            >
              {benchmarkKeys.map(benchmark => (
                <Option
                  value={benchmark}
                  key={'path-' + benchmark}
                >
                  {benchmark.replace("futhark-benchmarks/", "")}
                </Option>
              ))}
            </Select>
          }
        </Col>
        <Col span={4}>
          { benchmark != null && datasets != null &&
            <Select
              style={{ width: "100%", display: "block" }}
              onChange={(value) => changeDataset(index, value)}
              showSearch={true}
              autoFocus={true}
              value={dataset != null ? dataset : undefined}
            >
              {datasets.map(dataset => (
                <Option
                  value={dataset}
                  key={'path-' + dataset}
                >
                  {dataset}
                </Option>
              ))}
            </Select>
          }
        </Col>
        <Col span={4}>
          {hasPlus &&
              <Button type="primary" shape="circle" icon="plus" onClick={onAddPath} />
          }
          {(index > 0 || (index === 0 && count > 1)) &&
            <Button shape="circle" icon="minus" onClick={() => onRemovePath(index)} style={{marginLeft: hasPlus ? "5px" : "0px"}} />
          }
          {benchmark != null &&
            <Tooltip placement="bottom" title={"Add all the benchmarks datasets"}>
              <Button type="primary" shape="circle" icon="database" onClick={() => addAllDatasets(path, index)} style={{marginLeft: "5px"}} />
            </Tooltip>
          }
        </Col>
      </Row>
    )
  }
}

export default Path
