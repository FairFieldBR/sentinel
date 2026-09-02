import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { API_BASE, apiFetch } from '../config'

const AuthContext = createContext(null)

const REFRESH_KEY = 'sentinel_refresh_token'
const PROSPECTS_KEY = 'sentinel_prospects'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshTimerRef = useRef(null)

  const [ndaAccepted, setNdaAccepted] = useState(false)

  // Update NDA state when user changes
  useEffect(() => {
    if (user) {
      const accepted = localStorage.getItem(`sentinel_nda_${user.email}`)
      setNdaAccepted(accepted === 'true')
    } else {
      setNdaAccepted(false)
    }
  }, [user])

  // Store tokens and user data from auth response
  // Backend may return tokens at root level or nested inside `data`
  const handleAuthResponse = useCallback((resp) => {
    const d = resp.data || resp
    if (d.access_token || resp.access_token) {
      setAccessToken(d.access_token || resp.access_token)
    }
    if (d.refresh_token || resp.refresh_token) {
      localStorage.setItem(REFRESH_KEY, d.refresh_token || resp.refresh_token)
    }
    if (d.user || resp.user) {
      const u = d.user || resp.user
      setUser(u)
      localStorage.setItem('sentinel_user', JSON.stringify(u))
      localStorage.setItem('sentinel_auth', JSON.stringify(u))
    }
  }, [])

  // Clear all auth state
  const clearAuth = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem('sentinel_user')
    localStorage.removeItem('sentinel_auth')
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  // Refresh token
  const refreshTokenFn = useCallback(async () => {
    const rt = localStorage.getItem(REFRESH_KEY)
    if (!rt) return false
    try {
      const data = await apiFetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt })
      })
      const token = data.access_token || data.data?.access_token
      if (token) {
        handleAuthResponse(data)
        return token
      }
      return false
    } catch {
      // If refresh fails, check for legacy auth in localStorage
      return false
    }
  }, [handleAuthResponse])

  // On mount: try to restore session
  useEffect(() => {
    async function init() {
      const refreshed = await refreshTokenFn()
      if (!refreshed) {
        // Backward compat: try to restore from localStorage (OTP-based sessions)
        const saved = localStorage.getItem('sentinel_auth')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed && parsed.email) {
              setUser(parsed)
            }
          } catch { /* ignore */ }
        }
      }
      setIsLoading(false)
    }
    init()
  }, [refreshTokenFn])

  // Login with email + password
  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!data.sucesso && !data.access_token) {
      throw new Error(data.mensagem || data.message || 'Erro ao fazer login')
    }
    handleAuthResponse(data)
    return data
  }, [handleAuthResponse])

  // Register new account
  const register = useCallback(async (userData) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    if (!data.sucesso && !data.access_token) {
      throw new Error(data.mensagem || data.message || 'Erro ao criar conta')
    }
    handleAuthResponse(data)
    // Track prospect
    trackProspect({ ...userData, id: data.user?.id }, 'cadastro')
    return data
  }, [handleAuthResponse])

  // Logout
  const logout = useCallback(async () => {
    const rt = localStorage.getItem(REFRESH_KEY)
    try {
      if (rt) {
        await apiFetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify({ refresh_token: rt })
        }).catch(() => {})
      }
    } catch { /* best effort */ }
    clearAuth()
  }, [accessToken, clearAuth])

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    const data = await apiFetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      body: JSON.stringify(profileData)
    })
    if (data.user) {
      setUser(data.user)
      localStorage.setItem('sentinel_user', JSON.stringify(data.user))
      localStorage.setItem('sentinel_auth', JSON.stringify(data.user))
    }
    return data
  }, [accessToken])

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const data = await apiFetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    })
    return data
  }, [accessToken])

  // authFetch: fetch wrapper with Authorization header, auto-refresh on 401
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    }
    try {
      const data = await apiFetch(url, { ...options, headers })
      return data
    } catch (err) {
      // Try refreshing token on auth error
      if (err.message && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
        const refreshed = await refreshTokenFn()
        if (refreshed) {
          // Retry with the token returned by the refresh request.
          const newHeaders = {
            ...options.headers,
            Authorization: `Bearer ${refreshed}`
          }
          return apiFetch(url, { ...options, headers: newHeaders })
        }
      }
      throw err
    }
  }, [accessToken, refreshTokenFn])

  // ─── Legacy OTP methods (backward compat) ───
  const generateCode = useCallback(async (email, nome, empresa, telefone) => {
    const data = await apiFetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nome, empresa, telefone })
    })
    if (!data.sucesso) throw new Error(data.mensagem)
    return { devMode: data.dev_mode || false, devCode: data.dev_code || null, devPreview: data.dev_preview || null }
  }, [])

  const verifyCode = useCallback(async (email, code) => {
    const data = await apiFetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    })
    if (!data.sucesso) return { success: false }

    const userData = {
      id: Date.now().toString(),
      nome: data.data.nome,
      email: data.data.email,
      telefone: data.data.telefone,
      empresa: data.data.empresa,
      createdAt: new Date().toISOString(),
      verified: true
    }
    setUser(userData)
    localStorage.setItem('sentinel_user', JSON.stringify(userData))
    localStorage.setItem('sentinel_auth', JSON.stringify(userData))

    // Handle tokens if backend returns them
    if (data.access_token) setAccessToken(data.access_token)
    if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token)

    // Track prospect
    const prospects = JSON.parse(localStorage.getItem(PROSPECTS_KEY) || '[]')
    const existingIdx = prospects.findIndex(p => p.email === userData.email)
    const prospect = {
      id: userData.id, nome: userData.nome, email: userData.email,
      telefone: userData.telefone, empresa: userData.empresa,
      fase: 'verificado', faseLabel: 'Verificado',
      createdAt: userData.createdAt, updatedAt: new Date().toISOString()
    }
    if (existingIdx >= 0) { prospects[existingIdx] = { ...prospects[existingIdx], ...prospect } }
    else { prospects.push(prospect) }
    localStorage.setItem(PROSPECTS_KEY, JSON.stringify(prospects))
    return { success: true }
  }, [])

  // ─── NDA ───
  function acceptNda() {
    if (user) {
      localStorage.setItem(`sentinel_nda_${user.email}`, 'true')
      setNdaAccepted(true)
      trackProspect(user, 'nda_aceito')
    }
  }

  // ─── Prospect tracking (legacy) ───
  function trackProspect(userData, fase) {
    const prospects = JSON.parse(localStorage.getItem(PROSPECTS_KEY) || '[]')
    const existing = prospects.findIndex(p => p.email === userData.email)
    const prospect = {
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      telefone: userData.telefone,
      empresa: userData.empresa,
      fase,
      faseLabel: FASE_LABELS[fase] || fase,
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    if (existing >= 0) {
      prospects[existing] = { ...prospects[existing], ...prospect }
    } else {
      prospects.push(prospect)
    }
    localStorage.setItem(PROSPECTS_KEY, JSON.stringify(prospects))
  }

  function updateProspectPhase(email, fase) {
    const prospects = JSON.parse(localStorage.getItem(PROSPECTS_KEY) || '[]')
    const idx = prospects.findIndex(p => p.email === email)
    if (idx >= 0) {
      prospects[idx].fase = fase
      prospects[idx].faseLabel = FASE_LABELS[fase] || fase
      prospects[idx].updatedAt = new Date().toISOString()
      localStorage.setItem(PROSPECTS_KEY, JSON.stringify(prospects))
    }
  }

  function getProspects() {
    return JSON.parse(localStorage.getItem(PROSPECTS_KEY) || '[]')
  }

  function getAllUsers() {
    return JSON.parse(localStorage.getItem('sentinel_users') || '[]')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoading, accessToken,
      ndaAccepted,
      login, register, logout, updateProfile, changePassword,
      authFetch, refreshToken: refreshTokenFn,
      // Legacy compat
      generateCode, verifyCode, acceptNda,
      trackProspect, updateProspectPhase, getProspects, getAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

const FASE_LABELS = {
  cadastro: 'Cadastro',
  verificado: 'Verificado',
  nda_aceito: 'NDA Aceito',
  preenchendo_interno: 'Preenchendo (Interno)',
  preenchendo_externo: 'Preenchendo (Externo)',
  enviado_interno: 'Enviado (Interno)',
  enviado_externo: 'Enviado (Externo)'
}

export { FASE_LABELS }
