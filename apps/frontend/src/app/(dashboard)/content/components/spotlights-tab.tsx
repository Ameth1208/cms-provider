'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ListSkeleton } from '@/components/skeletons'
import { useContent, type Spotlight, type Section } from '../hooks/use-content'
import { useCatalog } from '@/app/(dashboard)/catalog/hooks/use-catalog'

export function SpotlightsTab() {
  const content = useContent()
  const catalog = useCatalog()
  const [sections, setSections] = useState<Section[]>([])
  const [spotlights, setSpotlights] = useState<Spotlight[]>([])
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSection, setSelectedSection] = useState('')
  const [searchProduct, setSearchProduct] = useState('')

  const loadSections = async () => {
    const secs = await content.fetchSections()
    setSections(secs || [])
    const featured = secs?.find((s) => s.type === 'featured') || secs?.[0]
    if (featured) {
      setSelectedSection(featured.id)
      loadSpotlights(featured.id)
    }
  }

  const loadSpotlights = async (sectionId: string) => {
    setLoading(true)
    const data = await content.fetchSpotlights(sectionId)
    setSpotlights(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadSections()
    catalog.fetchItems()
  }, [])

  useEffect(() => {
    setProducts(catalog.items.map((i: any) => ({ id: i.id, name: i.name })))
  }, [catalog.items])

  const handleSectionChange = (id: string) => {
    setSelectedSection(id)
    loadSpotlights(id)
  }

  const addProduct = async (catalogItemId: string) => {
    if (!selectedSection) return
    await content.addSpotlight({ sectionId: selectedSection, catalogItemId })
    loadSpotlights(selectedSection)
  }

  const removeProduct = async (spotlightId: string) => {
    await content.removeSpotlight(spotlightId)
    loadSpotlights(selectedSection)
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
    !spotlights.some((s) => s.catalogItemId === p.id),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select
          value={selectedSection}
          onChange={(e) => handleSectionChange(e.target.value)}
          className="h-9 px-3 rounded-lg bg-muted text-sm border-0"
        >
          {sections.filter((s) => s.type === 'featured' || s.type === 'new_arrivals').map((s) => (
            <option key={s.id} value={s.id}>{s.title || s.type}</option>
          ))}
          {sections.filter((s) => s.type !== 'featured' && s.type !== 'new_arrivals').map((s) => (
            <option key={s.id} value={s.id}>{s.title || s.type}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Selected products */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Productos en esta sección</h3>
          {loading ? (
            <ListSkeleton count={5} />
          ) : spotlights.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No hay productos</div>
          ) : (
            <div className="space-y-2">
              {spotlights.map((s) => (
                <Card key={s.id} className="border-0 bg-muted/40">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {s.catalogItem?.media?.[0]?.url && (
                        <img src={s.catalogItem.media[0].url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{s.catalogItem?.name || 'Producto'}</p>
                        <p className="text-xs text-muted-foreground">${s.catalogItem?.price}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeProduct(s.id)}>
                      <Icon icon="lucide:x" className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add products */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Agregar productos</h3>
          <Input
            placeholder="Buscar producto..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
          />
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredProducts.slice(0, 20).map((product) => (
              <button
                key={product.id}
                onClick={() => addProduct(product.id)}
                className="w-full text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors flex items-center justify-between"
              >
                <span className="text-sm">{product.name}</span>
                <Icon icon="lucide:plus" className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
            {filteredProducts.length === 0 && searchProduct && (
              <p className="text-sm text-muted-foreground text-center py-4">No se encontraron productos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
