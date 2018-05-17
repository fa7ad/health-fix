import React, { Component } from 'react'
import { Form, Icon, Input, Button } from 'antd'
import { inject } from 'mobx-react'

import api from './api'

const FormItem = Form.Item
class SignIn extends Component {
  state = {
    buttonType: 'primary',
    iconType: 'user'
  }

  render () {
    const { getFieldDecorator } = this.props.form
    return (
      <Form onSubmit={this.handleSubmit} className='login-form'>
        <FormItem>
          {getFieldDecorator('userName', {
            rules: [{ required: true, message: 'Please input your username!' }]
          })(<Input prefix={<Icon type='user' />} placeholder='Username' />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }]
          })(
            <Input
              prefix={<Icon type='lock' />}
              type='password'
              placeholder='Password'
            />
          )}
        </FormItem>
        <Button
          type={this.state.buttonType}
          htmlType='submit'
          className='login-form-button'
        >
          <Icon type={this.state.iconType} />Log in
        </Button>
      </Form>
    )
  }

  componentDidMount () {
    this.props.db
      .get('token')
      .then(() => this.props.history.push('/meals'))
      .catch(() => console.log('Welcome!'))
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (err) return console.error(err)
      this.setState({
        iconType: 'loading'
      })
      api
        .url('/auth')
        .json(values)
        .post()
        .json()
        .then(({ token }) => this.props.db.put('token', token))
        .then(() => {
          setTimeout(() => {
            this.props.history.push('/meals')
          }, 1e3)
          this.setState({ iconType: 'check', buttonType: 'dashed' })
        })
        .catch(res => {
          this.setState({ iconType: 'close', buttonType: 'danger' })
          this.props.form.resetFields()
          setTimeout(() => {
            this.setState({ iconType: 'user', buttonType: 'primary' })
          }, 3e3)
        })
    })
  }
}

export default inject('db')(Form.create()(SignIn))
