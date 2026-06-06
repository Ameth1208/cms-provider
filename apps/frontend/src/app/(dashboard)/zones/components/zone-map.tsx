'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface Zone {
  id: string
  name: string
  coordinates: string
  shippingCost: number
  estimatedDays: number
  color: string
}

interface ZoneMapProps {
  zones: Zone[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export function ZoneMap({ zones, center = [-34.6037, -58.3816], zoom = 12, height = '400px' }: ZoneMapProps) {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = ''
    document.head.appendChild(link)
    
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const parseCoordinates = (coords: string): [number, number][] => {
    try {
      const parsed = JSON.parse(coords)
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => Array.isArray(p) && p.length >= 2).map((p) => [p[0], p[1]])
      }
    } catch {
      // Invalid JSON
    }
    return []
  }

  // Calculate center from first zone with valid coordinates
  let mapCenter = center
  for (const zone of zones) {
    const coords = parseCoordinates(zone.coordinates)
    if (coords.length > 0) {
      mapCenter = coords[0]
      break
    }
  }

  const validZones = zones.filter((zone) => parseCoordinates(zone.coordinates).length > 0)

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '0.75rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validZones.map((zone) => {
        const coords = parseCoordinates(zone.coordinates)
        return (
          <Polygon
            key={zone.id}
            positions={coords}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: 0.2,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-1">
                <p className="font-medium">{zone.name}</p>
                <p className="text-sm text-muted-foreground">
                  Envío: ${zone.shippingCost.toFixed(2)} · {zone.estimatedDays} días
                </p>
              </div>
            </Popup>
          </Polygon>
        )
      })}
    </MapContainer>
  )
}
