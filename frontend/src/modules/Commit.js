import React, { Component } from 'react'
import {
  Select,
  Row,
  Col,
  Button,
  Input
} from 'antd'
const Option = Select.Option

class Commit extends Component {
  render() {
    const {
      skeleton,
      index,
      path,
      count,
      changeBackend,
      changeMachine,
      changeCommit,
      onRemovePath,
      onAddPath
    } = this.props

    const {
      machine,
      backend,
      commit
    } = path

    const machines = backend !== null && skeleton[backend] !== null ? Object.keys(skeleton[backend]) : []
    const backends = skeleton !== null ? Object.keys(skeleton) : []
    const hasPlus = index === 0 && machine !== null && backend !== null && commit !== null

    return (
      <div>
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
                    key={'compare-path-' + backend}
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
                value={machine}
              >
                {machines.map(machine => (
                  <Option
                    value={machine}
                    key={'compare-path-' + machine}
                  >
                    {machine}
                  </Option>
                ))}
              </Select>
            }
          </Col>
          <Col span={5}>
            { machine !== null && skeleton[backend][machine] !== null &&
              <Input
                style={{width: "100%"}}
                onChange={(e) => changeCommit(index, e.target.value)}
                value={(commit !== null) ? commit : undefined}
              />
            }
          </Col>
          <Col span={4}>
            { hasPlus &&
                <Button type="primary" shape="circle" icon="plus" onClick={onAddPath} />
            }
            { (index > 0 || (index === 0 && count > 1)) &&
              <Button shape="circle" icon="minus" onClick={() => onRemovePath(index)} style={{marginLeft: hasPlus ? "5px" : "0px"}} />
            }
          </Col>
        </Row>
      </div>
    )
  }
}

export default Commit
