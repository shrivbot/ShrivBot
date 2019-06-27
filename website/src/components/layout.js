import React from 'react'
import PropTypes from 'prop-types'
import { useStaticQuery, graphql } from 'gatsby'
import 'normalize.css'
import { Layout, Menu } from 'antd'
import '../sass/index.scss'

const { Header, Footer, Content } = Layout

const LayoutWrapper = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <Layout>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          style={{ lineHeight: '64px' }}
        >
          <Menu.Item key="1">ShrivBot</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '2rem' }}>{children}</Content>
      <Footer style={{ padding: '2rem' }}>low yeet</Footer>
    </Layout>
  )
}

LayoutWrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

export default LayoutWrapper
