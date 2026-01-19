import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // change to your real API
  timeout: 10000
})

// Example: add auth token interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  return config
})

export default api
