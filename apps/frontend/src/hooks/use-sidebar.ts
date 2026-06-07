'use client'

import { useState, useEffect } from 'react'

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar:collapsed')
    if (saved) setCollapsed(saved === 'true')
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebar:collapsed', String(!prev))
      return !prev
    })
  }

  return { collapsed, toggle }
}
