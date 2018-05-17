import React from 'react'

import { Button } from 'antd'

const DeleteButton = p => (
  <Button onClick={p.deleteMeal} type='danger'>{p.children}</Button>
)

export default DeleteButton
