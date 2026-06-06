'use client'

import { useState } from 'react'
import { useTranslation } from '@/i18n/use-translation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGeocoding } from '@/hooks/use-geocoding'
import { Search, MapPin, Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    coordinates: string
    shippingCost: number
    estimatedDays: number
    color: string
  }) => Promise<void>
  saving: boolean
}

function generatePolygonFromPoint(lat: number, lon: number, radiusKm: number = 2): string {
  // Generate a square polygon around a point
  const latDelta = radiusKm / 111
  const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))
  
  const coords = [
    [lat + latDelta, lon - lonDelta],
    [lat + latDelta, lon + lonDelta],
    [lat - latDelta, lon + lonDelta],
    [lat - latDelta, lon - lonDelta],
  ]
  
  return JSON.stringify(coords)
}

export function CreateZoneDialog({ open, onOpenChange, onSubmit, saving }: Props) {
  const { t } = useTranslation()
  const { results, loading: geoLoading, search } = useGeocoding()
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    coordinates: '',
    shippingCost: 0,
    estimatedDays: 1,
    color: '#3b82f6',
  })
  const [selectedLocation, setSelectedLocation] = useState('')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setShowResults(true)
    search(value)
  }

  const handleSelectAddress = (result: any) => {
    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    const boundingBox = result.boundingbox
    
    let coordinates: string
    
    if (boundingBox && boundingBox.length === 4) {
      // Use bounding box if available [minLat, maxLat, minLon, maxLon]
      const coords = [
        [parseFloat(boundingBox[1]), parseFloat(boundingBox[2])],
        [parseFloat(boundingBox[1]), parseFloat(boundingBox[3])],
        [parseFloat(boundingBox[0]), parseFloat(boundingBox[3])],
        [parseFloat(boundingBox[0]), parseFloat(boundingBox[2])],
      ]
      coordinates = JSON.stringify(coords)
    } else {
      // Generate polygon around the point
      coordinates = generatePolygonFromPoint(lat, lon)
    }
    
    setFormData({
      ...formData,
      name: result.display_name.split(',')[0],
      coordinates,
    })
    setSelectedLocation(result.display_name)
    setSearchQuery(result.display_name)
    setShowResults(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onOpenChange(false)
    setFormData({ name: '', coordinates: '', shippingCost: 0, estimatedDays: 1, color: '#3b82f6' })
    setSearchQuery('')
    setSelectedLocation('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md ">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('zones_create')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2 relative">
            <Label className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              Buscar zona (ciudad, barrio, localidad)
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ej: Palermo, Buenos Aires"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
              {geoLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {showResults && results.length > 0 && (
              <div className="absolute z-50 w-full bg-popover border border-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {results.map((result, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm"
                    onClick={() => handleSelectAddress(result)}
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('zones_name')}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {selectedLocation && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Ubicación:</span> {selectedLocation}
              </p>
              {formData.coordinates && (
                <p className="text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">Polígono:</span> Generado automáticamente
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('zones_cost')}</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.shippingCost}
                onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('zones_days')}</Label>
              <Input
                type="number"
                value={formData.estimatedDays}
                onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-9 w-16 rounded border border-border cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={saving || !formData.coordinates}>{t('create')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
