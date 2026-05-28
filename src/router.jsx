import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoginPage from './components/auth/LoginPage'
import DashboardPage from './components/dashboard/DashboardPage'

function ProtectedRoute({ children }) {
  const { accessToken } = useSelector((state) => state.auth)
  return accessToken ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { accessToken } = useSelector((state) => state.auth)
  return accessToken ? <Navigate to="/dashboard" replace /> : children
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
])
