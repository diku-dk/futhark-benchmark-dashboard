import React, { Component } from 'react'
import {
  Select,
  Row,
  Col,
  Input,
  Upload,
  Button,
  Icon,
  Divider
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
      changeCommit,
      changeFile
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
          <Col xxl={2} sm={24} md={3} lg={3} className="mobile-push-1x--bottom">
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
          <Col xxl={2} sm={24} md={4} lg={3} className="mobile-push-1x--bottom">
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
          <Col xxl={5} sm={24} md={7} lg={6} className="mobile-push-1x--bottom">
            {machine != null && skeleton[backend][machine] != null &&
              <Input
                style={{width: "100%"}}
                onChange={(e) => changeCommit(index, e.target.value)}
                value={(commit != null) ? commit : undefined}
              />
            }
          </Col>
          <Col xxl={3} sm={24} md={6} lg={5} className="mobile-push-1x--bottom">
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
          <Col xxl={3} sm={24} md={4} lg={4} className="mobile-push-1x--bottom">
            <Input
              style={{width: "100%"}}
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  try {
                    const value = JSON.parse(e.target.value)
                    changeFile(index, null, value)
                  } catch (e) {}
                }
              }}
              value={''}
              placeholder='Paste here to set data'
            />
          </Col>
        </Row>
        { index === 0 &&
          <Divider />
        }
      </div>
    )
  }
}

export default Commit
