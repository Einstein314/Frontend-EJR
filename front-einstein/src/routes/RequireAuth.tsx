import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function RequireAuth() {
  const token = localStorage.getItem('token')
  const location = useLocation()

  console.log('token:', token)

  if (!token || token === 'undefined' || token.trim() === '') {
    console.log('2') // bloqueado
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  console.log('1') // liberado
  return <Outlet />
}
