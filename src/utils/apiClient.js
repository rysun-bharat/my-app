import { store } from '../store'
import { logout } from '../store/slices/authSlice'

export async function authFetch(url, options = {}) {
  const { accessToken } = store.getState().auth

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.status === 401) {
    store.dispatch(logout())
  }

  return response
}
