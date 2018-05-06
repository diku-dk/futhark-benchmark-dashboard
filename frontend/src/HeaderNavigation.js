import React, { Component } from 'react'
import { 
  Layout,
  Menu
} from 'antd'
import { Link, withRouter } from "react-router-dom"
const { Header } = Layout

class HeaderNavigation extends Component {
  render() {
    const {location} = this.props

    const active = {
      '/': 'home',
      '/compare': 'compare',
      '/visualize': 'visualize'
    }[location.pathname]

    return (
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[active]}
          style={{ lineHeight: '64px' }}
        >
          <Menu.Item active key="home">
            <Link to="/">
              Home
            </Link>
          </Menu.Item>
          <Menu.Item key="visualize">
            <Link to="/visualize">
              Visualize
            </Link>
          </Menu.Item>
          <Menu.Item key="compare">
            <Link to="/compare">
              Compare
            </Link>
          </Menu.Item>
        </Menu>
      </Header>
    )
  }
}

export default withRouter(HeaderNavigation)
