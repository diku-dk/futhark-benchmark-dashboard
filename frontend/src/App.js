import React, { Component } from 'react'
import { 
  Layout,
  Menu
} from 'antd'
import './App.css'
import Visualize from "./Visualize/Visualize"
import Home from "./Home/Home"
import Compare from "./Compare/Compare"
import { BrowserRouter as Router, Route, Link } from "react-router-dom"
const { Header, Content } = Layout

class App extends Component {
  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <div className="app">
          <Layout className="layout">
            <Header>
              <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={['2']}
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
            <Layout
               style={{ padding: '24px', minHeight: "calc(100vh - 64px)" }}
            >
              <Content>
                <Route exact path="/" component={Home} />
                <Route exact path="/visualize" component={Visualize} />
                <Route exact path="/compare" component={Compare} />
              </Content>
            </Layout>
          </Layout>
        </div>
      </Router>
    )
  }
}

export default App
