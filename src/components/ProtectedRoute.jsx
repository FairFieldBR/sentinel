import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="flex flex-col items-center gap-4 animate-fadeIn">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-sentinel/20 border-t-sentinel animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width={24} height={24} viewBox="0 0 80 80" fill="none">
              <path d="M40 12 L62 24 L62 42 C62 56 52 66 40 70 C28 66 18 56 18 42 L18 24 Z"
                fill="none" stroke="#7DD3FC" strokeWidth="2" />
              <text x="40" y="48" textAnchor="middle" fill="#7DD3FC" fontSize="22" fontWeight="bold" fontFamily="Inter, sans-serif">$</text>
            </svg>
          </div>
        </div>
        <p className="text-sm text-white/40 font-medium">Carregando...</p>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return children
}
