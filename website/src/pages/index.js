import React from 'react'

import Layout from '../components/layout'
import SEO from '../components/seo'
import { Row, Col } from 'antd'

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <section>
      <Row type="flex" gutter="16" justify="space-around">
        <Col sm={24} md={8}>
          <h3>What is ShrivBot</h3>
          <p>
            ShrivBot is a global user karma ranking system to assist in
            filtering out trolls....or filtering them in.
          </p>
        </Col>
        <Col sm={24} md={8}>
          <img src="https://www.fillmurray.com/400/400" />
        </Col>
      </Row>
    </section>
    <br />
    <section>
      <Row type="flex" gutter="16" justify="space-around">
        <Col sm={24} md={8}>
          <img src="https://www.fillmurray.com/400/400" />
        </Col>
        <Col sm={24} md={8}>
          <h3>What is ShrivBot</h3>
          <p>
            ShrivBot is a global user karma ranking system to assist in
            filtering out trolls....or filtering them in.
          </p>
        </Col>
      </Row>
    </section>
  </Layout>
)

export default IndexPage
