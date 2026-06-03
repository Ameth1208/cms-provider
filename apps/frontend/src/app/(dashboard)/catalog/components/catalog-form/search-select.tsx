'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Option {
  id: string
  name: string
}

interface SingleProps {
  mode: 'single'
  value: string
  onChange: (id: string) => void
}

interface MultiProps {
  mode: 'multi'
  value: string[]
  onChange: (ids: string[]) => void
}

interface BaseProps {
  options: Option[]
  placeholder?: string
  searchPlaceholder?: string
  createPlaceholder?: string
  onCreate?: (name: string) => void
  disabled?: boolean
}

type SearchSelectProps = BaseProps & (SingleProps | MultiProps)

export function SearchSelect({
  options,
  value,
  onChange,
  mode,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  createPlaceholder = 'Crear',
  onCreate,
  disabled,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedIds = mode === 'single' ? (value ? [value] : []) : value
  const selectedOptions = options.filter((o) => selectedIds.includes(o.id))

  function handleSelect(id: string) {
    if (mode === 'single') {
      ;(onChange as (id: string) => void)(id)
      setOpen(false)
    } else {
      const has = (value as string[]).includes(id)
      const next = has ? (value as string[]).filter((v) => v !== id) : [...(value as string[]), id]
      ;(onChange as (ids: string[]) => void)(next)
    }
    setSearch('')
  }

  function handleRemove(id: string) {
    if (mode === 'single') {
      ;(onChange as (id: string) => void)('')
    } else {
      const next = (value as string[]).filter((v) => v !== id)
      ;(onChange as (ids: string[]) => void)(next)
    }
  }

  const hasExactMatch = options.some((o) => o.name.toLowerCase() === search.toLowerCase().trim())
  const canCreate = !!onCreate && !!search.trim() && !hasExactMatch

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              selectedOptions.length === 0 && 'text-muted-foreground',
            )}
          >
            <span className="truncate">
              {selectedOptions.length > 0
                ? selectedOptions.map((o) => o.name).join(', ')
                : placeholder}
            </span>
            <Icon icon="lucide:chevrons-up-down" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = selectedIds.includes(opt.id)
                  return (
                    <CommandItem
                      key={opt.id}
                      value={opt.name}
                      onSelect={() => handleSelect(opt.id)}
                      className="flex items-center justify-between"
                    >
                      <span>{opt.name}</span>
                      {isSelected && <Icon icon="lucide:check" className="h-4 w-4" />}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {canCreate && (
                <CommandGroup>
                  <CommandItem
                    value={`__create__${search}`}
                    onSelect={() => {
                      onCreate?.(search.trim())
                      setSearch('')
                      if (mode === 'single') setOpen(false)
                    }}
                    className="text-primary"
                  >
                    <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
                    {createPlaceholder} &quot;{search.trim()}&quot;
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected badges */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map((opt) => (
            <Badge
              key={opt.id}
              variant="secondary"
              className="text-xs gap-1 pr-1"
            >
              {opt.name}
              <button
                type="button"
                onClick={() => handleRemove(opt.id)}
                className="ml-0.5 rounded-full hover:bg-muted p-0.5"
              >
                <Icon icon="lucide:x" className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
