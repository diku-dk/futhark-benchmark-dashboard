import React, { Component } from 'react'
import { 
  Layout,
} from 'antd'
import { Route } from "react-router-dom"
import './App.css'
import Visualize from "../Visualize/Visualize"
import Home from "../Home/Home"
import Compare from "../Compare/Compare"
import HeaderNavigation from '../modules/HeaderNavigation'
const { Content } = Layout

class App extends Component {
  render() {
    return (
      <div className="app">
        <Layout className="layout">
          <HeaderNavigation />
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
    )
  }
}

export default App
