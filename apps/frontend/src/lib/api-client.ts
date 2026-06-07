const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api'

interface FetchOptions extends RequestInit {
  token?: string | null
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function apiClient<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
    })
  } catch (err) {
    // Error de red: CORS, backend caído, DNS, etc.
    const isCors = (err as Error).message?.includes('Failed to fetch')
    throw new ApiError(
      isCors
        ? 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo y que CORS esté configurado.'
        : (err as Error).message || 'Error de red',
      0,
    )
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('cms_auth')
      window.location.href = '/login'
      throw new ApiError('Sesión expirada', 401)
    }
    const error = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new ApiError(error.message || `HTTP ${res.status}`, res.status)
  }

  // Handle empty responses (e.g. 204 No Content or void returns)
  const contentLength = res.headers.get('content-length')
  const contentType = res.headers.get('content-type')
  if (contentLength === '0' || !contentType?.includes('application/json')) {
    return undefined as T
  }

  return res.json()
}

export const api = {
  get: <T = any>(path: string, token?: string | null) =>
    apiClient<T>(path, { method: 'GET', token }),

  post: <T = any>(path: string, body?: any, token?: string | null) =>
    apiClient<T>(path, { method: 'POST', body: JSON.stringify(body), token }),

  put: <T = any>(path: string, body?: any, token?: string | null) =>
    apiClient<T>(path, { method: 'PUT', body: JSON.stringify(body), token }),

  delete: <T = any>(path: string, token?: string | null) =>
    apiClient<T>(path, { method: 'DELETE', token }),

  uploadBatch: <T = any>(path: string, formData: FormData, token?: string | null) =>
    fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        if (res.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('cms_auth')
          window.location.href = '/login'
          throw new ApiError('Sesión expirada', 401)
        }
        throw new ApiError('Upload failed', res.status)
      }
      return res.json() as Promise<T>
    }).catch((err) => {
      if (err instanceof ApiError) throw err
      const isCors = (err as Error).message?.includes('Failed to fetch')
      throw new ApiError(
        isCors
          ? 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
          : (err as Error).message || 'Error de red',
        0,
      )
    }),

  upload: <T = any>(path: string, formData: FormData, token?: string | null) =>
    fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        if (res.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('cms_auth')
          window.location.href = '/login'
          throw new ApiError('Sesión expirada', 401)
        }
        throw new ApiError('Upload failed', res.status)
      }
      return res.json() as Promise<T>
    }).catch((err) => {
      if (err instanceof ApiError) throw err
      const isCors = (err as Error).message?.includes('Failed to fetch')
      throw new ApiError(
        isCors
          ? 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
          : (err as Error).message || 'Error de red',
        0,
      )
    }),
}
