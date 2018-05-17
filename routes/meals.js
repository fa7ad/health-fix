const { Router } = require('express')
const passport = require('passport')

const { debugOnly, orFalse } = require('../utils/')
const { levelDB } = require('../utils/db')

const route = Router()
const mealsdb = levelDB('meals')
const authenticate = passport.authenticate('jwt', { session: false })

route.get('/', authenticate, async (req, res) => {
  try {
    const meals = await mealsdb.get('meals')
    const mealsList = meals.map(meal => {
      const subscribed =
        meal.subscribers && meal.subscribers.indexOf(req.user.userName) > -1
      const { lunch, dinner, breakfast } = meal
      return { lunch, dinner, breakfast, subscribed }
    })
    res.json(mealsList)
  } catch (error) {
    res.status(404).json({
      ok: true,
      message: 'No meal plans available!',
      error: debugOnly(error)
    })
  }
})

route.post('/', authenticate, (req, res) => {
  mealsdb.get('meals', async (_, meals = []) => {
    try {
      const reply = await mealsdb.put('meals', meals.concat(req.body))
      res.json({
        ok: true,
        message: 'New meal plan successfully added',
        reply: orFalse(reply)
      })
    } catch (error) {
      res.status(500).json({ ok: false, error: debugOnly(error) })
    }
  })
})

route.put('/:id', authenticate, async (req, res) => {
  const meals = await mealsdb.get('meals')
  if (!meals[req.params.id]) {
    res.status(404).json({ ok: false, message: 'meal not found' })
    return
  }
  const oldsub = meals[req.params.id]['subscribers']
  meals[req.params.id]['subscribers'] = (oldsub || []).concat(req.user.userName)
  mealsdb.put('meals', meals).then(() => {
    res.json({ ok: true, message: 'subscribed to meal ' + req.params.id })
  })
})

route.delete('/:id', authenticate, async (req, res) => {
  const meals = await mealsdb.get('meals')
  if (!meals[req.params.id] || !meals[req.params.id]['subscribers']) {
    res
      .status(404)
      .json({ ok: false, message: 'meal not found or not subscribed' })
    return
  }
  const subIdx = meals[req.params.id]['subscribers'].indexOf(req.user.userName)
  meals[req.params.id]['subscribers'].splice(subIdx, 1)
  const reply = await mealsdb.put('meals', meals)
  res.json({
    ok: true,
    message: 'unsubscribed from meal ' + req.params.id,
    reply: orFalse(reply)
  })
})

route.delete('/:id/delete', authenticate, async (req, res) => {
  const meals = await mealsdb.get('meals')
  if (!meals[req.params.id]) {
    res.status(404).json({ ok: false, message: 'Meal plan not found' })
    return
  }
  meals.splice(req.params.id, 1)
  const reply = await mealsdb.put('meals', meals)
  res.json({
    ok: true,
    message: 'Meal plan successfully deleted',
    reply: orFalse(reply)
  })
})

module.exports = route
