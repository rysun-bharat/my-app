import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import { loginFailure, loginStart, loginSuccess } from '../../store/slices/authSlice'
import { LOGIN_URL } from '../../utils/constants'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loginStatus, loginError } = useSelector((state) => state.auth)

  const [values, setValues] = useState({
    userId: '',
    email: '',
    password: '',
  })
  const [touched, setTouched] = useState({})

  const errors = (() => {
    const next = {}
  
    if (!values.userId.trim()) next.userId = 'UserId is required'
    if (!values.email.trim()) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = 'Enter a valid email'
    if (!values.password) next.password = 'Password is required'
  
    return next
  })()

  const canSubmit = Object.keys(errors).length === 0

  const onChange = (key) => (e) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const onBlur = (key) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setTouched({ userId: true, email: true, password: true })
    if (!canSubmit) return

    dispatch(loginStart())

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bkms_id: values.userId,
          email_address: values.email,
          password: values.password,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        dispatch(loginFailure(data?.message || 'Login failed'))
        return
      }

      const accessToken = data?.access_token || data?.data?.access_token
      if (!accessToken) {
        dispatch(loginFailure('access_token not found in response'))
        return
      }

      const userType = data?.login_user_type ?? data?.data?.login_user_type ?? null
      const parentType = data?.login_parent_type ?? data?.data?.login_parent_type ?? null

      dispatch(loginSuccess({ accessToken, userType, parentType }))
      navigate('/dashboard', { replace: true })
    } catch (error) {
      dispatch(loginFailure(error?.message || 'Network error'))
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pt: 2,
          pb: 2,
          mb: 1,
          background: (theme) =>
            `linear-gradient(to bottom, ${theme.palette.background.default} 70%, transparent)`,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            height: { xs: 44, sm: 56 },
            width: 'auto',
            maxWidth: '80vw',
            objectFit: 'contain',
          }}
        />
      </Box>
      <Container maxWidth="sm">
        <Paper
          component="form"
          onSubmit={onSubmit}
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use your UserId and email to access your account.
              </Typography>
            </Box>

            <TextField
              label="UserId"
              name="userId"
              value={values.userId}
              onChange={onChange('userId')}
              onBlur={onBlur('userId')}
              error={Boolean(touched.userId && errors.userId)}
              helperText={touched.userId ? errors.userId : ' '}
              autoComplete="username"
              fullWidth
              required
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={onChange('email')}
              onBlur={onBlur('email')}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email ? errors.email : ' '}
              autoComplete="email"
              fullWidth
              required
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={onChange('password')}
              onBlur={onBlur('password')}
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password ? errors.password : ' '}
              autoComplete="current-password"
              fullWidth
              required
            />

            {loginError ? <Alert severity="error">{loginError}</Alert> : null}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!canSubmit || loginStatus === 'loading'}
            >
              {loginStatus === 'loading' ? 'Signing In...' : 'Sign In'}
            </Button>

          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

