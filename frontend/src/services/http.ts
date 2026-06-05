import axios from 'axios'

export const http = axios.create({
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      // Don't intercept 403 here, let the components handle it
      // as they have specific error messages for missing permissions
      console.warn('403 Forbidden received for:', error.config?.url)
    }
    return Promise.reject(error)
  },
)

