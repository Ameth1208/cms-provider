'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

export interface CountryCode {
  code: string
  prefix: string
  maxLength?: number
}

export const DEFAULT_COUNTRIES: CountryCode[] = [
  { code: 'ar', prefix: '+54', maxLength: 10 },
  { code: 'br', prefix: '+55', maxLength: 11 },
  { code: 'cl', prefix: '+56', maxLength: 9 },
  { code: 'uy', prefix: '+598', maxLength: 8 },
  { code: 'py', prefix: '+595', maxLength: 9 },
  { code: 'bo', prefix: '+591', maxLength: 8 },
  { code: 'pe', prefix: '+51', maxLength: 9 },
  { code: 'co', prefix: '+57', maxLength: 10 },
  { code: 'ec', prefix: '+593', maxLength: 9 },
  { code: 've', prefix: '+58', maxLength: 10 },
  { code: 'mx', prefix: '+52', maxLength: 10 },
  { code: 'us', prefix: '+1', maxLength: 10 },
  { code: 'es', prefix: '+34', maxLength: 9 },
]

function FlagIcon({ code, size = 20 }: { code: string; size?: number }) {
  return (
    <Icon
      icon={`flag:${code}-4x3`}
      width={size}
      height={size * 0.75}
      className="shrink-0"
    />
  )
}

export interface PhoneInputProps {
  value?: string
  country?: string
  onChange?: (value: string) => void
  onCountryChange?: (country: string) => void
  countries?: CountryCode[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function PhoneInput({
  value = '',
  country = 'AR',
  onChange,
  onCountryChange,
  countries = DEFAULT_COUNTRIES,
  placeholder,
  disabled,
  className,
}: PhoneInputProps) {
  const code = country.toLowerCase()
  const selectedCountry = countries.find((c) => c.code === code) || countries[0]

  const handleCountryChange = (val: string) => {
    onCountryChange?.(val.toUpperCase())
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const maxLen = selectedCountry.maxLength || 15
    onChange?.(raw.slice(0, maxLen))
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Select
        value={code}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[100px] shrink-0 rounded-xl">
          <SelectValue placeholder="País">
            <span className="flex items-center gap-2">
              <FlagIcon code={selectedCountry.code} />
              <span className="text-muted-foreground text-xs">{selectedCountry.prefix}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="flex items-center gap-2">
                <FlagIcon code={c.code} />
                <span className="text-muted-foreground text-xs">{c.prefix}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder || '11 1234-5678'}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground font-normal ring-offset-background placeholder:text-muted-foreground/80 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
        )}
      />
    </div>
  )
}

export function formatPhone(phone: string, countryCode: string, countries = DEFAULT_COUNTRIES): string {
  const code = countryCode.toLowerCase()
  const country = countries.find((c) => c.code === code)
  if (!country || !phone) return phone
  return `${country.prefix} ${phone}`
}

export function detectCountryFromPhone(phone: string, countries = DEFAULT_COUNTRIES): string {
  if (!phone) return countries[0]?.code || 'AR'
  const cleaned = phone.replace(/\s/g, '')
  for (const country of countries) {
    if (cleaned.startsWith(country.prefix)) {
      return country.code.toUpperCase()
    }
  }
  return countries[0]?.code.toUpperCase() || 'AR'
}

export function stripPrefix(phone: string, countryCode: string, countries = DEFAULT_COUNTRIES): string {
  if (!phone) return ''
  const code = countryCode.toLowerCase()
  const country = countries.find((c) => c.code === code)
  if (!country) return phone
  const cleaned = phone.replace(/\s/g, '')
  if (cleaned.startsWith(country.prefix)) {
    return cleaned.slice(country.prefix.length)
  }
  return phone.replace(/\D/g, '')
}
