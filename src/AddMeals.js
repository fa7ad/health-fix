import capitalize from 'lodash.capitalize'
import { inject } from 'mobx-react'
import React, { Component } from 'react'
import { Form, Input, Button, Icon } from 'antd'

import api from './api'
import Meals from './Meals'

const FormItem = p => (
  <Form.Item
    label={capitalize(p.label)}
    {...{
      labelCol: { span: 4 },
      wrapperCol: { span: 14 }
    }}
  >
    {p.decorator(p.label, {
      rules: [{ required: p.required || false, message: p.message }]
    })(<Input placeholder={capitalize(p.label)} />)}
  </Form.Item>
)

class AddMeals extends Component {
  state = {
    loading: <Icon type='loading' />,
    iconType: 'plus',
    buttonType: 'primary'
  }

  render () {
    const { getFieldDecorator } = this.props.form
    return (
      <Meals
        selectedKey='/add-meals'
        style={{
          background: '#fff',
          padding: 24,
          margin: 24
        }}
        {...this.props}
      >
        {this.state.loading ||
          <Form onSubmit={this.addMeals} layout='horizontal'>
            <FormItem
              label='breakfast'
              decorator={getFieldDecorator.bind(this)}
              required
              message='Please input your Breakfast!'
            />
            <FormItem
              label='lunch'
              decorator={getFieldDecorator.bind(this)}
              required
              message='Please input your Lunch!'
            />
            <FormItem
              label='dinner'
              decorator={getFieldDecorator.bind(this)}
              required
              message='Please input your Dinner!'
            />
            <Form.Item
              {...{
                wrapperCol: { span: 14, offset: 4 }
              }}
            >
              <Button type={this.state.buttonType} htmlType='submit'>
                <Icon type={this.state.iconType} />Add Meal
              </Button>
            </Form.Item>
          </Form>}
      </Meals>
    )
  }

  addMeals = e => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (err) return console.error(err)
      this.setState({
        iconType: 'loading'
      })
      this.props.db.get('token').then(token =>
        api
          .url('/meals')
          .auth(`Bearer ${token}`)
          .json(values)
          .post()
          .json(res => {
            console.log(res)
          })
          .then(() => {
            this.setState({ iconType: 'check', buttonType: 'dashed' })
            this.props.form.resetFields()
            setTimeout(() => {
              this.setState({ iconType: 'plus', buttonType: 'primary' })
            }, 1e3)
          })
          .catch(() => {
            this.setState({ iconType: 'close', buttonType: 'danger' })
            this.props.form.resetFields()
            setTimeout(() => {
              this.setState({ iconType: 'plus', buttonType: 'primary' })
            }, 3e3)
          })
      )
    })
  }

  componentDidMount () {
    this.props.db
      .get('token')
      .then(token =>
        api.url('/admin')
          .auth(`Bearer ${token}`)
          .get()
          .json()
      )
      .then(({ admin }) => {
        if (admin) this.setState({ loading: false })
        else throw new Error('Not authorized')
      })
      .catch(() => this.props.history.push('/auth'))
  }
}

export default Form.create()(inject('db')(AddMeals))
