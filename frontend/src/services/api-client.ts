import axios from 'axios'
import { API_BASE_URL } from '@/constants/api'
import { parseAxiosError } from '@/lib/error'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = parseAxiosError(error)

    if (appError.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/entrar'
    }

    return Promise.reject(appError)
  },
)
