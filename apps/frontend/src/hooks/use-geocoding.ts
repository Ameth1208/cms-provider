'use client'

import { useState, useCallback } from 'react'

interface GeocodingResult {
  lat: string
  lon: string
  display_name: string
  address: {
    city?: string
    town?: string
    state?: string
    country?: string
    postcode?: string
    road?: string
    suburb?: string
    neighbourhood?: string
  }
}

export function useGeocoding() {
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setResults([])
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'es',
          },
        }
      )
      
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError('No se pudo buscar la dirección')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, error, search }
}
