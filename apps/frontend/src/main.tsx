import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProviderCustom } from './contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotificationsProvider } from './contexts/NotificationsContext'
import App from './pages/App'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Contact from './pages/Contact'
import Leaderboard from './pages/Leaderboard'
import './i18n'

const queryClient = new QueryClient()

const ProtectedAdmin: React.FC = () => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const hasAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPERADMIN')
  return hasAdmin ? <Admin /> : <Navigate to="/" replace />
}

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login /> },
  { path: '/admin', element: <ProtectedAdmin /> },
  { path: '/contact', element: <Contact /> },
  { path: '/leaderboard', element: <Leaderboard /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProviderCustom>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationsProvider>
            <RouterProvider router={router} />
          </NotificationsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProviderCustom>
  </React.StrictMode>,
)
