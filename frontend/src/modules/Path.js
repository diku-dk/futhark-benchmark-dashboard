import React, { Component } from 'react'
import {
  Select,
  Row,
  Col,
  Button,
  Tooltip,
  Card
} from 'antd'
import {
  isMobile,
  isTablet
} from './utils'
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
      togglePath,
      onAddPath,
      onRemovePath,
      addAllDatasets
    } = this.props

    const {
      machine,
      backend,
      benchmark,
      dataset,
      active,
      color
    } = path

    const machines = backend != null && skeleton[backend] != null ? Object.keys(skeleton[backend]) : []
    const backends = skeleton != null ? Object.keys(skeleton) : []
    const benchmarkKeys = benchmarks != null ? Object.keys(benchmarks) : []
    const datasets = (benchmarks != null && benchmark != null ) ? benchmarks[benchmark] : []
    const hasPlus = index === (count - 1) && benchmark != null && datasets != null && dataset != null

    const Content = () => (
      <Row gutter={16} style={{marginBottom: "10px"}}>
        <Col xxl={1} xl={1} lg={1} sm={2} xs={4} className="mobile-push-1x--bottom">
          <span
            style={{
              backgroundColor: `rgba(${color}, ${active ? '1.0' : '0.5'})`,
              width: "40px",
              height: "32px",
              display: "block",
              "cursor": "pointer"
            }}
            onClick={() => togglePath(index)}
          >
          </span>
        </Col>
        <Col xxl={2} xl={3} lg={3} sm={22} xs={20} className="mobile-push-1x--bottom">
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
        <Col xxl={2} xl={3} lg={3} sm={24} xs={24} className="mobile-push-1x--bottom">
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
        <Col xxl={4} xl={5} lg={7} sm={24} xs={24} className="mobile-push-1x--bottom">
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
        <Col xxl={4} xl={5} lg={6} sm={24} xs={24} className="mobile-push-1x--bottom">
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
        <Col xxl={4} xl={4} lg={4} sm={24} xs={24}>
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

    if (isMobile() || isTablet()) {
      return (
        <div style={{marginBottom: "10px"}}>
          <Card bordered>
            <Content />
          </Card>
        </div>
      )
    } else {
      return (<Content />)
    }
  }
}

export default Path
