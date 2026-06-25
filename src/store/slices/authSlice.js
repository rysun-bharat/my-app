import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: null,
    userType: null,
    parentType: null,
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
    },
    clearLoginError: (state) => {
      state.loginError = null
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, clearLoginError } =
  authSlice.actions

export default authSlice.reducer
