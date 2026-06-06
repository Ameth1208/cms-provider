'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Next.js
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapMarker {
  id: string
  name: string
  address?: string
  latitude: number
  longitude: number
}

interface MapViewProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export function MapView({ markers, center = [-34.6037, -58.3816], zoom = 13, height = '400px' }: MapViewProps) {
  useEffect(() => {
    // Fix Leaflet CSS in Next.js
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

  const validMarkers = markers.filter((m) => m.latitude && m.longitude)

  // Calculate center if markers exist
  const mapCenter = validMarkers.length > 0 
    ? [validMarkers[0].latitude, validMarkers[0].longitude] as [number, number]
    : center

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '0.75rem', zIndex: 1 }}
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {validMarkers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={defaultIcon}
        >
          <Popup>
            <div className="p-1">
              <p className="font-medium">{marker.name}</p>
              {marker.address && <p className="text-sm text-muted-foreground">{marker.address}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
