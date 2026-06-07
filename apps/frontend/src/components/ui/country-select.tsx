'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/react'
import { COUNTRIES, Country } from '@/lib/countries'
import { Button } from './button'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export type { Country }
export { COUNTRIES }

function FlagIcon({ code, size = 18 }: { code: string; size?: number }) {
  return (
    <Icon
      icon={`flag:${code.toLowerCase()}-4x3`}
      width={size}
      height={size * 0.75}
      className="shrink-0"
    />
  )
}

interface CountrySelectProps {
  value?: string
  onChange?: (code: string) => void
  placeholder?: string
  className?: string
}

export function CountrySelect({ value = 'CO', onChange, placeholder = 'Seleccionar país', className }: CountrySelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = useMemo(() => COUNTRIES.find((c) => c.code === value) || COUNTRIES[0], [value])

  const filtered = useMemo(() => {
    if (!query.trim()) return COUNTRIES
    const q = query.toLowerCase()
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.dialCode.includes(q),
    )
  }, [query])

  const handleSelect = (code: string) => {
    onChange?.(code)
    setOpen(false)
    setQuery('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between h-9 px-3 text-sm', className)}
        >
          <div className="flex items-center gap-2">
            <FlagIcon code={selected.code} />
            <span className="truncate">{selected.name}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 !z-[9999]" align="start" sideOffset={4}>
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar país..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No se encontraron países
            </div>
          ) : (
            filtered.map((country) => (
              <button
                key={country.code}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-left',
                  value === country.code && 'bg-primary/5',
                )}
                onClick={() => handleSelect(country.code)}
              >
                <FlagIcon code={country.code} />
                <span className="flex-1">{country.name}</span>
                <span className="text-xs text-muted-foreground">{country.dialCode}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
