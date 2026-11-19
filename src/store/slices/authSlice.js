import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'auth'

function loadPersistedAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistAuth({ accessToken, userType, parentType }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, userType, parentType }))
  } catch {
    // ignore storage errors (e.g. private browsing, quota exceeded)
  }
}

function clearPersistedAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

const persisted = loadPersistedAuth()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: persisted?.accessToken ?? null,
    userType: persisted?.userType ?? null,
    parentType: persisted?.parentType ?? null,
    loginStatus: 'idle',
    loginError: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loginStatus = 'loading'
      state.loginError = null
    },
    loginSuccess: (state, action) => {
      state.loginStatus = 'succeeded'
      state.accessToken = action.payload.accessToken
      state.userType = action.payload.userType
      state.parentType = action.payload.parentType
      state.loginError = null
      persistAuth(action.payload)
    },
    loginFailure: (state, action) => {
      state.loginStatus = 'failed'
      state.loginError = action.payload || 'Login failed'
    },
    logout: (state) => {
      state.accessToken = null
      state.userType = null
      state.parentType = null
      state.loginStatus = 'idle'
      state.loginError = null
      clearPersistedAuth()
    },
    clearLoginError: (state) => {
      state.loginError = null
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, clearLoginError } =
  authSlice.actions

export default authSlice.reducer
