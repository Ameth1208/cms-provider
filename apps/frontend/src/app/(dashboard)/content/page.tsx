'use client'

import { Icon } from '@iconify/react'
import { ContentBuilder } from './components/content-builder'

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Contenido del sitio</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">
          Arrastra para ordenar, edita y previsualiza tu homepage en tiempo real
        </p>
      </div>

      <ContentBuilder />
    </div>
  )
}
