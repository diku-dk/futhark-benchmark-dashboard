import React, { Component } from 'react'
import {
  Select,
  Row,
  Col,
  Input,
  Upload,
  Button,
  Icon
} from 'antd'
const Option = Select.Option

class Commit extends Component {
  constructor(props) {
    super(props)
    this.beforeUpload = this.beforeUpload.bind(this)
  }

  beforeUpload(file) {
    const {changeFile, index} = this.props

    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target.result
      changeFile(index, file.name, JSON.parse(data))
    }
    reader.readAsBinaryString(file)
    return false
  }

  render() {
    const {
      skeleton,
      index,
      path,
      changeBackend,
      changeMachine,
      changeCommit
    } = this.props

    const {
      machine,
      backend,
      commit,
      file
    } = path

    const machines = backend != null && skeleton[backend] != null ? Object.keys(skeleton[backend]) : []
    const backends = skeleton != null ? Object.keys(skeleton) : []

    return (
      <div>
        <Row gutter={16} style={{marginBottom: "10px"}}>
          <Col lg={2} sm={24} className="mobile-push-1x--bottom">
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
                    key={'compare-path-' + backend}
                  >
                    {backend}
                  </Option>
                ))}
              </Select>
            }
          </Col>
          <Col lg={2} sm={24} className="mobile-push-1x--bottom">
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
                    key={'compare-path-' + machine}
                  >
                    {machine}
                  </Option>
                ))}
              </Select>
            }
          </Col>
          <Col lg={5} sm={24}>
            {machine != null && skeleton[backend][machine] != null &&
              <Input
                style={{width: "100%"}}
                onChange={(e) => changeCommit(index, e.target.value)}
                value={(commit != null) ? commit : undefined}
              />
            }
          </Col>
          <Col lg={5} sm={24}>
            <Upload
              beforeUpload={this.beforeUpload}
              onPreview={() => false}
              showUploadList={false}
            >
              <Button>
                <Icon type="upload" /> 
                {(file) ? file : 'Click/drag here to upload'}
              </Button>
            </Upload>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Commit
