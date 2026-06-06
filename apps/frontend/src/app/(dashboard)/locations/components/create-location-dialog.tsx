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
import { LocationPickerMap } from '@/components/location-picker-map'
import { Search, MapPin, Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    address: string
    city?: string
    state?: string
    zip?: string
    country: string
    phone?: string
    email?: string
    latitude?: number
    longitude?: number
    isMain: boolean
  }) => Promise<void>
  saving: boolean
}

export function CreateLocationDialog({ open, onOpenChange, onSubmit, saving }: Props) {
  const { t } = useTranslation()
  const { results, loading: geoLoading, search } = useGeocoding()
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'AR',
    phone: '',
    email: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    isMain: false,
  })

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setShowResults(true)
    search(value)
  }

  const handleSelectAddress = (result: any) => {
    const address = result.address || {}
    setFormData({
      ...formData,
      address: result.display_name.split(',')[0],
      city: address.city || address.town || address.suburb || '',
      state: address.state || '',
      zip: address.postcode || '',
      country: address.country || 'AR',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    })
    setSearchQuery(result.display_name)
    setShowResults(false)
  }

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onOpenChange(false)
    setFormData({
      name: '', address: '', city: '', state: '', zip: '',
      country: 'AR', phone: '', email: '',
      latitude: undefined, longitude: undefined, isMain: false,
    })
    setSearchQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('locations_create')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>{t('locations_name')} *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2 relative">
            <Label className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              Buscar dirección
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
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

          <LocationPickerMap
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationSelect={handleMapLocationSelect}
            height="200px"
          />

          <div className="space-y-2">
            <Label>{t('locations_address')} *</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('locations_city')}</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('locations_state')}</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Latitud</Label>
              <Input
                type="number"
                step="any"
                value={formData.latitude || ''}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Longitud</Label>
              <Input
                type="number"
                step="any"
                value={formData.longitude || ''}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isMain"
              checked={formData.isMain}
              onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="isMain" className="text-sm">{t('locations_main')}</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={saving}>{t('create')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
