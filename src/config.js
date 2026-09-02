// URL base do backend. Em dev (Vite proxy), deixa vazio.
// Em produção, usa a variável de ambiente VITE_API_URL.
export const API_BASE = import.meta.env.VITE_API_URL || ''

// Utilitário de fetch com tratamento robusto de erros (compatível com Safari)
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  let res
  try {
    res = await fetch(url, options)
  } catch (networkErr) {
    throw new Error('Servidor indisponível. Verifique sua conexão ou tente mais tarde.')
  }

  // Garante que a resposta é JSON antes de parsear (evita crash no Safari com HTML 404)
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    if (!res.ok) {
      throw new Error(`Servidor indisponível (${res.status}). O backend não está acessível neste link.`)
    }
    throw new Error('Resposta inesperada do servidor.')
  }

  const data = await res.json()
  return data
}
