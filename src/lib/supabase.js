import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(raw) {
  if (!raw) return ''
  // Strip REST/GraphQL paths if user copied the wrong URL from the dashboard
  return raw.trim().replace(/\/+$/, '').replace(/\/(rest|graphql)\/v\d+$/, '')
}

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null

export async function getUserId() {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('You must be signed in')
  return user.id
}

// ─── Orders (income) ─────────────────────────────────────────────────────────

export function mapOrderFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    seedId: row.seed_id,
    customerId: row.customer_id || null,
    date: row.order_date || null,
    client: row.client || '',
    handle: row.handle || '',
    set: row.set_type || '',
    mapping: row.mapping || '',
    amount: Number(row.amount) || 0,
    period: row.period || '',
    notes: row.notes || '',
    status: row.status || 'completed',
  }
}

export function mapOrderToDb(order) {
  return {
    seed_id: order.seedId || (typeof order.id === 'string' && order.id.startsWith('o') ? order.id : null),
    customer_id: order.customerId || null,
    order_date: order.date || null,
    client: order.client || '',
    handle: order.handle || '',
    set_type: order.set || '',
    mapping: order.mapping || '',
    amount: Number(order.amount) || 0,
    period: order.period || '',
    notes: order.notes || '',
    status: order.status || 'completed',
  }
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export function mapExpenseFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    seedId: row.seed_id,
    supplierId: row.supplier_id || null,
    date: row.expense_date || null,
    vendor: row.vendor || '',
    description: row.description || '',
    amount: Number(row.amount) || 0,
    period: row.period || '',
    notes: row.notes || '',
  }
}

export function mapExpenseToDb(expense) {
  return {
    seed_id: expense.seedId || (typeof expense.id === 'string' && expense.id.startsWith('e') ? expense.id : null),
    supplier_id: expense.supplierId || null,
    expense_date: expense.date || null,
    vendor: expense.vendor || '',
    description: expense.description || '',
    amount: Number(expense.amount) || 0,
    period: expense.period || '',
    notes: expense.notes || '',
  }
}

// ─── Customers ───────────────────────────────────────────────────────────────

export function mapCustomerFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name || '',
    handle: row.handle || '',
    platform: row.platform || '',
    phone: row.phone || '',
    email: row.email || '',
    notes: row.notes || '',
    orderCount: row.order_count != null ? Number(row.order_count) : undefined,
    totalSpent: row.total_spent != null ? Number(row.total_spent) : undefined,
  }
}

export function mapCustomerToDb(customer) {
  return {
    name: customer.name || '',
    handle: customer.handle || '',
    platform: customer.platform || '',
    phone: customer.phone || '',
    email: customer.email || '',
    notes: customer.notes || '',
  }
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export function mapSupplierFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name || '',
    platform: row.platform || '',
    handle: row.handle || '',
    phone: row.phone || '',
    email: row.email || '',
    notes: row.notes || '',
    purchaseCount: row.purchase_count != null ? Number(row.purchase_count) : undefined,
    totalSpent: row.total_spent != null ? Number(row.total_spent) : undefined,
  }
}

export function mapSupplierToDb(supplier) {
  return {
    name: supplier.name || '',
    platform: supplier.platform || '',
    handle: supplier.handle || '',
    phone: supplier.phone || '',
    email: supplier.email || '',
    notes: supplier.notes || '',
  }
}

// ─── Inventory (lash sets) ───────────────────────────────────────────────────

export function mapInventoryFromDb(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name || '',
    mapping: row.mapping || '',
    price: Number(row.price) || 0,
    notes: row.notes || '',
    orderCount: row.order_count != null ? Number(row.order_count) : undefined,
    totalRevenue: row.total_revenue != null ? Number(row.total_revenue) : undefined,
  }
}

export function mapInventoryToDb(item) {
  return {
    name: item.name || '',
    mapping: item.mapping || '',
    price: Number(item.price) || 0,
    notes: item.notes || '',
  }
}

// ─── Platform detection (from handles / vendor names) ────────────────────────

export function detectPlatform(text) {
  if (!text) return ''
  const t = text.toLowerCase()
  if (/^0\d{9}$/.test(text.replace(/\s/g, '')) || /^\d{10,}$/.test(text.replace(/\s/g, ''))) return 'phone'
  if (t.includes('snap')) return 'snapchat'
  if (t.includes('insta')) return 'instagram'
  if (t.includes('tiktok') || t.includes('tik tok')) return 'tiktok'
  if (t.includes('whatsapp') || t.includes('wa.me')) return 'whatsapp'
  if (t.includes('instagram')) return 'instagram'
  return ''
}

export function detectSupplierPlatform(name) {
  if (!name) return 'other'
  const n = name.toLowerCase()
  if (n.includes('tiktok') || n.includes('tik tok')) return 'tiktok'
  if (n.includes('instagram') || n.includes('insta')) return 'instagram'
  if (n.includes('whatsapp')) return 'whatsapp'
  return 'instagram'
}

// Merge duplicate supplier names into one canonical vendor
export const SUPPLIER_MERGE_GROUPS = {
  'Lash Supply Store': [
    'Lash Supply Store (Instagram)',
    'lash supply store',
  ],
  'ilash shop': [
    'the_ilash_shop (Instagram)',
    'the_ilash_shop',
    'ilash',
    'ilashshop',
    'iLash shop',
  ],
  'ilashaddict_supply': [
    'ilashaddict',
    'ilash addict',
    'ilashaddict supply',
    'ilashaddict_supply ',
  ],
}

export function normalizeSupplierName(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return trimmed
  const lower = trimmed.toLowerCase()

  for (const [canonical, aliases] of Object.entries(SUPPLIER_MERGE_GROUPS)) {
    if (lower === canonical.toLowerCase()) return canonical
    if (aliases.some((a) => a.toLowerCase() === lower)) return canonical
  }
  return trimmed
}
