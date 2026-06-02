export type DiscountType = 'PERCENTAGE' | 'FIXED'

export interface Campaign {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  active: boolean
  autoApply: boolean
  organizationId: string
  discounts: Discount[]
}

export interface Discount {
  id: string
  type: DiscountType
  value: number
  code: string | null
  maxUses: number | null
  usedCount: number
  campaignId: string
}

export interface CreateCampaign {
  name: string
  description?: string
  startDate: string
  endDate: string
  autoApply: boolean
  discounts: { type: DiscountType; value: number; code?: string; maxUses?: number }[]
}
