import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const RoleRoute = ({ allowedRoles, children }) => {
  const { role } = useAuth()

  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />

  return children
}

export default RoleRoute
