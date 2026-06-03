# Frontend Architecture Rules

> These rules govern how frontend code must be structured. They are mandatory.

## 1. File Separation Rule

Every feature/module MUST separate concerns into dedicated files. No exceptions.

### 1.1 `page.tsx` — Entry Point Only

A `page.tsx` file MUST NOT contain:
- API calls directly
- useState/useEffect logic for data fetching
- Large JSX blocks (over ~40 lines)
- Inline form handlers

A `page.tsx` file MUST ONLY:
- Import and compose sections/components
- Pass props down (if needed)
- Render the layout structure

**Max lines in page.tsx: ~60**

### 1.2 `hooks/use-{feature}.ts` — Data & Logic Layer

Every feature MUST have a dedicated hook that handles:
- All API calls (via `api-client`)
- Local state with `useState`/`useCallback`/`useEffect`
- Form state management (when Zustand store is not needed)
- Data transformation/formatting

The hook MUST return an object with everything the UI needs.

```ts
export function useInventory() {
  const { token } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  // ... fetch, create, update logic
  return { items, loading, fetchItems, createBatch, ... }
}
```

### 1.3 `components/*.tsx` — Presentational Components

Components MUST be dumb where possible:
- Receive data via props
- Call handlers passed from hooks or parent
- No direct API calls inside components

Components CAN have local UI state (open/close dialogs, form inputs).

### 1.4 `store/{feature}-store.ts` — Global State (Zustand)

Use Zustand stores ONLY when:
- Multiple components need shared state
- State needs to persist across navigation
- Complex form state (like catalog-form-store)

Do NOT use Zustand for simple fetch-and-display pages.

## 2. Naming Conventions

- Hooks: `use-{feature}.ts` (kebab-case)
- Components: `{feature}-{role}.tsx` (kebab-case, PascalCase export)
- Stores: `{feature}-store.ts` (kebab-case)
- Types: co-located in `types.ts` or inline in hook file

## 3. API Calls

ALL API calls MUST go through:
- `hooks/use-{feature}.ts` for feature-specific calls
- `lib/api-client.ts` for the HTTP layer

NO inline `fetch()` or `api.get()` inside components or pages.

## 4. Example Structure

```
app/(dashboard)/inventory/
├── page.tsx                 # Entry point, composes sections
├── hooks/
│   └── use-inventory.ts     # All data logic, API calls
├── components/
│   ├── inventory-list.tsx   # Table/grid of items
│   ├── inventory-detail.tsx # Detail modal/drawer
│   └── batch-form.tsx       # Form to create batch
└── types.ts                 # Shared types (optional)
```

## 5. State Management Rule (No Prop Drilling)

Components MUST use the feature's dedicated hook directly via `use-{feature}()` instead of receiving data and handlers through props from a parent.

**When to use hooks directly:**
- Dialogs and modals that need form state (open state, form fields, submit handlers)
- Lists that need loading state and data arrays
- Any component that shares the same data layer as its parent page

**When props ARE acceptable:**
- Presentational lists receiving data arrays (`items`, `onToggle`)
- Reusable UI components (badges, cards, buttons)
- Components that need callbacks specific to their parent context

**Example (GOOD):**
```tsx
// ❌ BAD: 38 props
export function CreateClientDialog({
  open, onOpenChange, orgName, setOrgName, ...
}) { ... }

// ✅ GOOD: Use hook directly
export function CreateClientDialog() {
  const { createOpen, setCreateOpen, orgName, setOrgName, createClient } = useAdminClients()
  return <Dialog open={createOpen} onOpenChange={setCreateOpen}>...</Dialog>
}
```

## 6. Anti-Patterns (Forbidden)

- ❌ Page files with >100 lines
- ❌ Inline API calls in JSX
- ❌ useState/useEffect for data fetching inside page.tsx
- ❌ Multiple features logic in one hook
- ❌ Components importing `api-client` directly
- ❌ Passing more than 5 props to a component when a hook exists
