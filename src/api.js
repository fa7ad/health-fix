import wretch from 'wretch'

export default wretch().url(
  process.env.REACT_APP_API_URL || 'http://localhost:5000'
)
