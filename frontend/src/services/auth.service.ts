import { apiClient } from './api-client'
import { API_ENDPOINTS } from '@/constants/api'
import type { AuthTokenResponse } from '@/types/api'
import type { User } from '@/types/models'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: 'professor' | 'student'
  department_id: number
  profile_link?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthTokenResponse> {
    const { data } = await apiClient.post<AuthTokenResponse>(
      API_ENDPOINTS.auth.register,
      payload,
    )
    return data
  },

  async login(payload: LoginPayload): Promise<AuthTokenResponse> {
    const { data } = await apiClient.post<AuthTokenResponse>(
      API_ENDPOINTS.auth.login,
      payload,
    )
    return data
  },

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.logout)
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<{ data: User }>(API_ENDPOINTS.auth.me)
    return data.data
  },
}
