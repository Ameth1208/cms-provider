import { create } from 'zustand'

export interface CustomerAddress {
  id: string
  label: string
  street: string
  city: string
  state?: string
  zip?: string
  country: string
  isDefault: boolean
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  document?: string
  documentType?: string
  notes?: string
  active: boolean
  createdAt: string
  addresses: CustomerAddress[]
  _count?: { orders: number }
}

interface CustomersState {
  customers: Customer[]
  loading: boolean
  selected: Customer | null
  createOpen: boolean
  editOpen: boolean
  formName: string
  formEmail: string
  formPhone: string
  formDocument: string
  formDocumentType: string
  formNotes: string
  setCustomers: (customers: Customer[]) => void
  setLoading: (loading: boolean) => void
  setSelected: (customer: Customer | null) => void
  setCreateOpen: (open: boolean) => void
  setEditOpen: (open: boolean) => void
  setFormName: (name: string) => void
  setFormEmail: (email: string) => void
  setFormPhone: (phone: string) => void
  setFormDocument: (document: string) => void
  setFormDocumentType: (type: string) => void
  setFormNotes: (notes: string) => void
  openEdit: (customer: Customer) => void
  resetForm: () => void
}

export const useCustomersStore = create<CustomersState>((set) => ({
  customers: [],
  loading: false,
  selected: null,
  createOpen: false,
  editOpen: false,
  formName: '',
  formEmail: '',
  formPhone: '',
  formDocument: '',
  formDocumentType: 'dni',
  formNotes: '',
  setCustomers: (customers) => set({ customers }),
  setLoading: (loading) => set({ loading }),
  setSelected: (selected) => set({ selected }),
  setCreateOpen: (createOpen) => set({ createOpen }),
  setEditOpen: (editOpen) => set({ editOpen }),
  setFormName: (formName) => set({ formName }),
  setFormEmail: (formEmail) => set({ formEmail }),
  setFormPhone: (formPhone) => set({ formPhone }),
  setFormDocument: (formDocument) => set({ formDocument }),
  setFormDocumentType: (formDocumentType) => set({ formDocumentType }),
  setFormNotes: (formNotes) => set({ formNotes }),
  openEdit: (customer) => set({
    selected: customer,
    formName: customer.name,
    formEmail: customer.email,
    formPhone: customer.phone || '',
    formDocument: customer.document || '',
    formDocumentType: customer.documentType || 'dni',
    formNotes: customer.notes || '',
    editOpen: true,
  }),
  resetForm: () => set({
    formName: '',
    formEmail: '',
    formPhone: '',
    formDocument: '',
    formDocumentType: 'dni',
    formNotes: '',
    selected: null,
  }),
}))
