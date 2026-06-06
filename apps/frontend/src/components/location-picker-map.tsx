'use client'

import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useTranslation } from '@/i18n/use-translation'
import 'leaflet/dist/leaflet.css'

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface LocationPickerMapProps {
  latitude?: number
  longitude?: number
  onLocationSelect: (lat: number, lng: number) => void
  height?: string
}

function DraggableMarker({ position, onDragEnd }: { 
  position: [number, number]
  onDragEnd: (lat: number, lng: number) => void 
}) {
  const [pos, setPos] = useState(position)

  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng])
      onDragEnd(e.latlng.lat, e.latlng.lng)
    },
  })

  return (
    <Marker
      position={pos}
      icon={defaultIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          const newPos = marker.getLatLng()
          setPos([newPos.lat, newPos.lng])
          onDragEnd(newPos.lat, newPos.lng)
        },
      }}
    />
  )
}

export function LocationPickerMap({ latitude, longitude, onLocationSelect, height = '250px' }: LocationPickerMapProps) {
  const { t } = useTranslation()
  const [position, setPosition] = useState<[number, number]>(
    latitude && longitude ? [latitude, longitude] : [-34.6037, -58.3816]
  )

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude])
    }
  }, [latitude, longitude])

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng])
    onLocationSelect(lat, lng)
  }, [onLocationSelect])

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height, width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <DraggableMarker 
          position={position} 
          onDragEnd={handleLocationChange} 
        />
      </MapContainer>
      <div className="bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        {t('map_click_or_drag')}
      </div>
    </div>
  )
}
