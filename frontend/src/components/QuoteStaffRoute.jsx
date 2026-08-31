import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function QuoteStaffRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="w-12 h-12 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!['admin', 'broker'].includes(user?.role)) return <Navigate to="/meu-painel" replace />

  return children
}
