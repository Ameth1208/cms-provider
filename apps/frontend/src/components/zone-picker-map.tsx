'use client'

import { useState, useCallback } from 'react'
import { useTranslation } from '@/i18n/use-translation'
import { MapContainer, TileLayer, Polygon, useMapEvents, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface ZonePickerMapProps {
  zones?: { coordinates: string; color: string }[]
  onZoneSelect: (coords: [number, number][]) => void
  height?: string
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function generatePolygonAroundPoint(lat: number, lon: number, radiusKm: number = 2): [number, number][] {
  const latDelta = radiusKm / 111
  const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))
  
  return [
    [lat + latDelta, lon - lonDelta],
    [lat + latDelta, lon + lonDelta],
    [lat - latDelta, lon + lonDelta],
    [lat - latDelta, lon - lonDelta],
  ]
}

function parseExistingCoords(coords: string): [number, number][] {
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

export function ZonePickerMap({ zones = [], onZoneSelect, height = '250px' }: ZonePickerMapProps) {
  const { t } = useTranslation()
  const [previewCoords, setPreviewCoords] = useState<[number, number][] | null>(null)
  const [center] = useState<[number, number]>([-34.6037, -58.3816])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    const polygon = generatePolygonAroundPoint(lat, lng)
    setPreviewCoords(polygon)
    onZoneSelect(polygon)
  }, [onZoneSelect])

  const existingZones = zones
    .map((z) => ({ coords: parseExistingCoords(z.coordinates), color: z.color }))
    .filter((z) => z.coords.length > 0)

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height, width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapClickHandler onClick={handleMapClick} />
        
        {/* Existing zones */}
        {existingZones.map((zone, i) => (
          <Polygon
            key={`existing-${i}`}
            positions={zone.coords}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: 0.15,
              weight: 2,
            }}
          />
        ))}
        
        {/* Preview polygon */}
        {previewCoords && (
          <Polygon
            positions={previewCoords}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.3,
              weight: 3,
              dashArray: '5, 10',
            }}
          />
        )}
      </MapContainer>
      <div className="bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        {t('map_click_for_zone')}
      </div>
    </div>
  )
}
