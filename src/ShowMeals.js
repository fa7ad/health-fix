import * as R from 'ramda'
import React, { Component } from 'react'
import { inject } from 'mobx-react'
import { Icon, List, Timeline, Button } from 'antd'

import api from './api'
import Meals from './Meals'
import SubButton from './SubscribeButton'
import DeleteButton from './DeleteButton'
import './ShowMeals.css'

const mealWeight = {
  breakfast: 0,
  lunch: 1,
  dinner: 2
}

const sortMealTimes = R.compose(
  R.sortBy(([k, v]) => mealWeight[k]),
  R.toPairs,
  R.pickAll(R.keys(mealWeight))
)

const toTimelineItem = ([time, meal]) => (
  <Timeline.Item
    dot={<Icon type='clock-circle-o' />}
    key={Date.now() + Math.random()}
  >
    <b>{time.toUpperCase()}: </b>{meal}
  </Timeline.Item>
)

class ShowMeals extends Component {
  state = {
    loading: <Icon type='loading' />,
    mealPlans: [],
    buttonContent: true,
    isAdmin: false
  }

  render () {
    return (
      <Meals
        selectedKey='/meals'
        style={{
          background: '#fff',
          padding: 24,
          margin: 24
        }}
        {...this.props}
      >
        {this.state.loading ||
          <List
            itemLayout='horizontal'
            dataSource={this.state.mealPlans}
            renderItem={(item, ind) => (
              <List.Item className='meal--item' key={ind}>
                <Timeline>
                  {R.compose(R.map(toTimelineItem), sortMealTimes)(item)}
                </Timeline>
                <Button.Group>
                  <SubButton
                    subscribed={item.subscribed}
                    onToggleSub={this.toggleSub(ind)}
                  />
                  {this.state.isAdmin &&
                    <DeleteButton deleteMeal={this.deleteMealData(ind)}>
                      Delete Meal
                    </DeleteButton>}
                </Button.Group>
              </List.Item>
            )}
          />}
      </Meals>
    )
  }

  componentDidMount () {
    this.props.db.get('token').then(token => {
      api
        .url('/meals')
        .auth(`Bearer ${token}`)
        .get()
        .error(404, res =>
          this.setState({ loading: <div>No Meals Available!</div> })
        )
        .error(401, res => {
          this.props.history.push('/auth')
        })
        .json()
        .then(data => {
          this.setState(p => ({
            loading: false,
            mealPlans: p.mealPlans.concat(data)
          }))
        })
        .then(() => api.url('/admin').auth(`Bearer ${token}`).get().json())
        .then(({ admin }) => this.setState({ isAdmin: admin }))
    })
  }

  toggleSub = idx => subd => {
    this.props.db
      .get('token')
      .then(token =>
        api
          .url(`/meals/${idx}`)
          .auth(`Bearer ${token}`)[subd ? 'delete' : 'put']()
          .json()
      )
      .then(res => console.log(res))
  }
  deleteMealData = idx => () => {
    this.props.db
      .get('token')
      .then(token =>
        api.url(`/meals/${idx}/delete`).auth(`Bearer ${token}`).delete().json()
      )
      .then(res => {
        if (!res.ok) throw new Error('Request Failed!')
        this.setState(p => ({ mealPlans: R.remove(idx, 1, p.mealPlans) }))
      })
      .catch(e => console.warn(e))
  }
}
export default inject('db')(ShowMeals)
