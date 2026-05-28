import { useSelector } from 'react-redux'
import LoginPage from './components/auth/LoginPage.jsx'
import DashboardPage from './components/dashboard/DashboardPage.jsx'

export default function App() {
  const { accessToken } = useSelector((state) => state.auth)
  return accessToken ? <DashboardPage /> : <LoginPage />
}
