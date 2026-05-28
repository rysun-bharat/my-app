import { useState } from 'react'
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Toolbar,
  Typography,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import logo from '../../assets/logo.svg'
import { logout } from '../../store/slices/authSlice'
import { LOGOUT_URL } from '../../utils/constants'

const stats = [
  { label: 'My Events', value: 0, emoji: '📅', color: '#1976d2', bg: '#e3f0fc' },
  { label: 'My Users',  value: 0, emoji: '👥', color: '#388e3c', bg: '#e8f5e9' },
  { label: 'My Surveys', value: 0, emoji: '📋', color: '#f57c00', bg: '#fff3e0' },
]

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { accessToken } = useSelector((state) => state.auth)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [logoutError, setLogoutError] = useState(null)

  const onLogout = async () => {
    setLogoutLoading(true)
    setLogoutError(null)
    try {
      await fetch(LOGOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch {
      // proceed with local logout even if API call fails
    } finally {
      setLogoutLoading(false)
      dispatch(logout())
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={1} color="inherit">
        <Toolbar sx={{ gap: 2 }}>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 40, width: 'auto', objectFit: 'contain' }}
          />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={
              logoutLoading ? <CircularProgress size={14} color="error" /> : null
            }
            onClick={onLogout}
            disabled={logoutLoading}
          >
            {logoutLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here is an overview of your activity.
          </Typography>
        </Box>

        {logoutError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {logoutError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {stats.map(({ label, value, emoji, color, bg }) => (
            <Grid size={{ xs: 12, sm: 4 }} key={label}>
              <Card
                elevation={0}
                sx={{
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                      {label}
                    </Typography>
                    <Avatar
                      sx={{
                        bgcolor: bg,
                        width: 40,
                        height: 40,
                        fontSize: 20,
                        color,
                      }}
                    >
                      {emoji}
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight={700} color={color}>
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
