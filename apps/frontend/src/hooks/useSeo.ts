'use client'

import { useEffect } from 'react'
import type { SeoMetadata } from '@cms/shared'

export function useSeo(seo: SeoMetadata | null) {
  useEffect(() => {
    if (!seo) return

    document.title = seo.title

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(name.startsWith('og:') ? 'property' : 'name', name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', seo.description)
    setMeta('keywords', seo.keywords.join(', '))
    setMeta('og:title', seo.title)
    setMeta('og:description', seo.description)
    setMeta('og:type', seo.ogType)
    setMeta('og:url', seo.canonical)
    if (seo.ogImage) setMeta('og:image', seo.ogImage)

    return () => {
      document.title = 'CMS Web Manager'
    }
  }, [seo])
}
