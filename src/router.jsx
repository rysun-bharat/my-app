import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoginPage from './components/auth/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardHome from './components/dashboard/DashboardHome'
import UserPageLists from './components/user/userPageLists'
import EventsPage from './components/events/EventsPage'
import SurveysPage from './components/surveys/SurveysPage'

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
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      { path: 'users', element: <UserPageLists /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'surveys', element: <SurveysPage /> },
    ],
  },
])
