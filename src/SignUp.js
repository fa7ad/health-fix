import React, { Component } from 'react'
import { Form, Icon, Input, Button } from 'antd'

import api from './api'
import './Auth.css'

const FormItem = Form.Item
class SignUp extends Component {
  state = {
    buttonType: 'primary',
    iconType: 'user-add'
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
          {getFieldDecorator('email', {
            rules: [{ required: true, message: 'Please input your Email!' }]
          })(<Input prefix={<Icon type='mail' />} placeholder='Email' />)}
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
          <Icon type={this.state.iconType} /> SignUp
        </Button>
      </Form>
    )
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
        .put()
        .json(res => {
          this.setState({ iconType: 'check', buttonType: 'dashed' })
          this.props.form.resetFields()
          setTimeout(() => {
            this.props.history.push('/auth/')
          }, 1e3)
        })
        .catch(res => {
          if (!res.ok) {
            this.setState({ iconType: 'close', buttonType: 'danger' })
            this.props.form.resetFields()
            setTimeout(() => {
              this.setState({ iconType: 'user', buttonType: 'primary' })
            }, 3e3)
          }
        })
    })
  }
}

export default Form.create()(SignUp)
