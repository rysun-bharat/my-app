import { useState } from 'react'
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { useDispatch } from 'react-redux'
import { Link, Outlet, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import { logout } from '../../store/slices/authSlice'
import { LOGOUT_URL } from '../../utils/constants'
import { authFetch } from '../../utils/apiClient'

const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { label: 'Users', path: '/dashboard/users', icon: '👥' },
  { label: 'Events', path: '/dashboard/events', icon: '📅' },
  { label: 'Surveys', path: '/dashboard/surveys', icon: '📋' },
]

export default function DashboardLayout() {
  const dispatch = useDispatch()
  const location = useLocation()
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [logoutError, setLogoutError] = useState(null)

  const onLogout = async () => {
    setLogoutLoading(true)
    setLogoutError(null)
    try {
      await authFetch(LOGOUT_URL, { method: 'POST' })
    } catch {
      // proceed with local logout even if API call fails
    } finally {
      setLogoutLoading(false)
      dispatch(logout())
    }
  }

  const isActive = (path) =>
    path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path)

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

      {logoutError && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity="error">{logoutError}</Alert>
        </Box>
      )}

      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              position: 'static',
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <List>
            {NAV_ITEMS.map(({ label, path, icon }) => (
              <ListItemButton key={path} component={Link} to={path} selected={isActive(path)}>
                <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
