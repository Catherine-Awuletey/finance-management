import {
  supabase,
  getUserId,
  mapOrderFromDb,
  mapOrderToDb,
  mapExpenseFromDb,
  mapExpenseToDb,
  mapCustomerFromDb,
  mapCustomerToDb,
  mapSupplierFromDb,
  mapSupplierToDb,
  mapInventoryFromDb,
  mapInventoryToDb,
  detectPlatform,
  detectSupplierPlatform,
  normalizeSupplierName,
  SUPPLIER_MERGE_GROUPS,
} from './supabase'
import { orders as seedOrders, expenses as seedExpenses, VENDORS } from '../data/seedData'

function assertClient() {
  if (!supabase) throw new Error('Supabase is not configured')
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

export async function fetchOrders() {
  assertClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('order_date', { ascending: false, nullsFirst: false })

  if (error) throw error
  return (data || []).map(mapOrderFromDb)
}

export async function fetchExpenses() {
  assertClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false, nullsFirst: false })

  if (error) throw error
  return (data || []).map(mapExpenseFromDb)
}

export async function fetchCustomers() {
  assertClient()
  const { data: rows, error } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  if (error) throw error

  const { data: stats } = await supabase.from('customer_revenue').select('*')
  const revMap = new Map((stats || []).map((r) => [r.customer_id, r]))

  return (rows || [])
    .map((c) => mapCustomerFromDb({
      ...c,
      order_count: revMap.get(c.id)?.order_count ?? 0,
      total_spent: revMap.get(c.id)?.total_spent ?? 0,
    }))
    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
}

export async function updateCustomer(id, updates) {
  assertClient()
  const payload = mapCustomerToDb(updates)
  const { data, error } = await supabase
    .from('customers')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapCustomerFromDb(data)
}

export async function insertCustomer(customer) {
  assertClient()
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('customers')
    .insert({ ...mapCustomerToDb(customer), user_id: userId })
    .select()
    .single()

  if (error) throw error
  return mapCustomerFromDb(data)
}

export async function deleteCustomer(id) {
  assertClient()
  // Unlink orders — keep order history, remove customer reference
  await supabase.from('orders').update({ customer_id: null }).eq('customer_id', id)
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw error
}

export async function fetchSuppliers() {
  assertClient()
  const { data: rows, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  if (error) throw error

  const { data: stats } = await supabase.from('supplier_spend').select('*')
  const spendMap = new Map((stats || []).map((r) => [r.supplier_id, r]))

  return (rows || [])
    .map((s) => mapSupplierFromDb({
      ...s,
      purchase_count: spendMap.get(s.id)?.purchase_count ?? 0,
      total_spent: spendMap.get(s.id)?.total_spent ?? 0,
    }))
    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
}

export async function updateSupplier(id, updates) {
  assertClient()
  const payload = mapSupplierToDb(updates)
  const { data, error } = await supabase
    .from('suppliers')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Keep expense vendor labels in sync when name changes
  if (updates.name) {
    await supabase.from('expenses').update({ vendor: updates.name }).eq('supplier_id', id)
  }

  return mapSupplierFromDb(data)
}

export async function insertSupplier(supplier) {
  assertClient()
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('suppliers')
    .insert({ ...mapSupplierToDb(supplier), user_id: userId })
    .select()
    .single()

  if (error) throw error
  return mapSupplierFromDb(data)
}

export async function fetchInventory() {
  assertClient()
  const { data: rows, error } = await supabase
    .from('inventory')
    .select('*')
    .order('name')

  if (error) throw error

  const { data: orderRows } = await supabase.from('orders').select('set_type, amount')
  const stats = new Map()
  for (const o of orderRows || []) {
    const name = o.set_type || ''
    if (!name) continue
    const prev = stats.get(name) || { orderCount: 0, totalRevenue: 0 }
    prev.orderCount += 1
    prev.totalRevenue += Number(o.amount) || 0
    stats.set(name, prev)
  }

  return (rows || []).map((row) => mapInventoryFromDb({
    ...row,
    order_count: stats.get(row.name)?.orderCount ?? 0,
    total_revenue: stats.get(row.name)?.totalRevenue ?? 0,
  }))
}

export async function insertInventoryItem(item) {
  assertClient()
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('inventory')
    .insert({ ...mapInventoryToDb(item), user_id: userId })
    .select()
    .single()

  if (error) throw error
  return mapInventoryFromDb(data)
}

export async function updateInventoryItem(id, updates) {
  assertClient()

  let oldName = null
  if (updates.name) {
    const { data: existing } = await supabase.from('inventory').select('name').eq('id', id).single()
    oldName = existing?.name
  }

  const payload = mapInventoryToDb(updates)
  const { data, error } = await supabase
    .from('inventory')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (oldName && updates.name && oldName !== updates.name) {
    await supabase.from('orders').update({ set_type: updates.name }).eq('set_type', oldName)
  }

  return mapInventoryFromDb(data)
}

export async function deleteInventoryItem(id) {
  assertClient()
  const { error } = await supabase.from('inventory').delete().eq('id', id)
  if (error) throw error
}

export async function fetchInventoryOrders(setName) {
  assertClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('set_type', setName)
    .order('order_date', { ascending: false })

  if (error) throw error
  return (data || []).map(mapOrderFromDb)
}

export async function fetchCustomerOrders(customerId) {
  assertClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('order_date', { ascending: false })

  if (error) throw error
  return (data || []).map(mapOrderFromDb)
}

export async function fetchSupplierExpenses(supplierId) {
  assertClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('expense_date', { ascending: false })

  if (error) throw error
  return (data || []).map(mapExpenseFromDb)
}

// ─── Orders CRUD ─────────────────────────────────────────────────────────────

export async function insertOrder(order) {
  assertClient()
  const userId = await getUserId()
  const customerId = await resolveCustomerId(userId, order.client, order.handle)

  const payload = { ...mapOrderToDb(order), user_id: userId, customer_id: customerId }
  delete payload.seed_id
  if (order.seedId) payload.seed_id = order.seedId

  const { data, error } = await supabase.from('orders').insert(payload).select().single()
  if (error) throw error
  return mapOrderFromDb(data)
}

export async function updateOrder(id, updates) {
  assertClient()
  const payload = mapOrderToDb({ ...updates })
  delete payload.seed_id

  if (updates.client !== undefined || updates.handle !== undefined) {
    const userId = await getUserId()
    payload.customer_id = await resolveCustomerId(userId, updates.client, updates.handle)
  }

  const { data, error } = await supabase.from('orders').update(payload).eq('id', id).select().single()
  if (error) throw error
  return mapOrderFromDb(data)
}

export async function deleteOrder(id) {
  assertClient()
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}

// ─── Expenses CRUD ───────────────────────────────────────────────────────────

export async function insertExpense(expense) {
  assertClient()
  const userId = await getUserId()
  const supplierId = await resolveSupplierId(userId, expense.vendor)

  const payload = { ...mapExpenseToDb(expense), user_id: userId, supplier_id: supplierId }
  delete payload.seed_id

  const { data, error } = await supabase.from('expenses').insert(payload).select().single()
  if (error) throw error
  return mapExpenseFromDb(data)
}

export async function updateExpense(id, updates) {
  assertClient()
  const payload = mapExpenseToDb({ ...updates })
  delete payload.seed_id

  if (updates.vendor !== undefined) {
    const userId = await getUserId()
    payload.supplier_id = await resolveSupplierId(userId, updates.vendor)
  }

  const { data, error } = await supabase.from('expenses').update(payload).eq('id', id).select().single()
  if (error) throw error
  return mapExpenseFromDb(data)
}

export async function deleteExpense(id) {
  assertClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ─── Link helpers ────────────────────────────────────────────────────────────

async function resolveCustomerId(userId, client, handle) {
  const name = (client || handle || '').trim()
  if (!name) return null

  const h = (handle || '').trim()
  const platform = detectPlatform(h || name)
  const phone = platform === 'phone' ? h || name : ''

  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .eq('handle', h)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('customers')
    .insert({ user_id: userId, name, handle: h, platform, phone })
    .select('id')
    .single()

  if (error) throw error
  return created.id
}

async function resolveSupplierId(userId, vendorName) {
  const name = normalizeSupplierName(vendorName)
  if (!name) return null

  const { data: existing } = await supabase
    .from('suppliers')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('suppliers')
    .insert({
      user_id: userId,
      name,
      platform: detectSupplierPlatform(name),
    })
    .select('id')
    .single()

  if (error) throw error
  return created.id
}

/** Merge duplicate supplier records and re-link all their expenses */
export async function mergeSuppliers(canonicalName, aliasNames) {
  assertClient()
  const userId = await getUserId()
  const allNames = [canonicalName, ...aliasNames]

  const { data: supplierRows, error: supErr } = await supabase
    .from('suppliers')
    .select('id, name, notes, handle, platform')
    .eq('user_id', userId)
    .in('name', allNames)

  if (supErr) throw supErr
  if (!supplierRows?.length) return { merged: 0 }

  let canonical = supplierRows.find((s) => s.name === canonicalName)

  if (!canonical) {
    const { data: created, error } = await supabase
      .from('suppliers')
      .insert({
        user_id: userId,
        name: canonicalName,
        platform: detectSupplierPlatform(canonicalName),
        handle: '',
        notes: '',
      })
      .select('id, name, notes, handle, platform')
      .single()
    if (error) throw error
    canonical = created
  }

  // Combine notes from all duplicate records
  const combinedNotes = supplierRows
    .filter((s) => s.id !== canonical.id && s.notes)
    .map((s) => `[${s.name}] ${s.notes}`)
    .join('\n')

  if (combinedNotes && !canonical.notes?.includes(combinedNotes)) {
    const notes = [canonical.notes, combinedNotes].filter(Boolean).join('\n')
    await supabase.from('suppliers').update({ notes }).eq('id', canonical.id)
  }

  const duplicateIds = supplierRows.filter((s) => s.id !== canonical.id).map((s) => s.id)

  // Re-link expenses by supplier_id
  for (const dupId of duplicateIds) {
    await supabase
      .from('expenses')
      .update({ supplier_id: canonical.id, vendor: canonicalName })
      .eq('supplier_id', dupId)
  }

  // Re-link expenses that match vendor name but wrong/missing supplier_id
  await supabase
    .from('expenses')
    .update({ supplier_id: canonical.id, vendor: canonicalName })
    .eq('user_id', userId)
    .in('vendor', allNames)

  // Remove duplicate supplier rows
  if (duplicateIds.length) {
    await supabase.from('suppliers').delete().in('id', duplicateIds)
  }

  return { merged: duplicateIds.length, canonicalId: canonical.id }
}

export async function mergeAllKnownSupplierDuplicates() {
  let total = 0
  for (const [canonical, aliases] of Object.entries(SUPPLIER_MERGE_GROUPS)) {
    const result = await mergeSuppliers(canonical, aliases)
    total += result.merged
  }
  return total
}

// ─── Seed ────────────────────────────────────────────────────────────────────

function extractCustomersFromSeed(orders) {
  const map = new Map()
  for (const o of orders) {
    const name = (o.client || o.handle || '').trim()
    if (!name) continue
    const handle = (o.handle || '').trim()
    const key = `${name.toLowerCase()}|${handle.toLowerCase()}`
    if (!map.has(key)) {
      map.set(key, {
        name: o.client || o.handle,
        handle,
        platform: detectPlatform(handle || name),
        phone: detectPlatform(handle || name) === 'phone' ? (handle || name) : '',
      })
    }
  }
  return [...map.values()]
}

function extractSuppliersFromSeed(expenses) {
  const names = new Set([
    ...VENDORS.map(normalizeSupplierName),
    ...expenses.map((e) => normalizeSupplierName(e.vendor)).filter(Boolean),
  ])
  return [...names].map((name) => ({
    name,
    platform: detectSupplierPlatform(name),
  }))
}

export async function seedDatabase() {
  assertClient()
  const userId = await getUserId()
  const counts = await getCounts()

  const customerRows = extractCustomersFromSeed(seedOrders).map((c) => ({
    ...c,
    user_id: userId,
    notes: '',
  }))

  const supplierRows = extractSuppliersFromSeed(seedExpenses).map((s) => ({
    ...s,
    user_id: userId,
    handle: '',
    notes: '',
  }))

  // Use insert on empty DB — upsert needs unique constraints that may be missing on upgraded schemas
  const write = async (table, rows) => {
    if (!rows.length) return
    const { error } = await supabase.from(table).insert(rows)
    if (error) throw new Error(`${table}: ${error.message}`)
  }

  if (counts.customers === 0) await write('customers', customerRows)
  if (counts.suppliers === 0) await write('suppliers', supplierRows)

  const { data: customers, error: custErr } = await supabase
    .from('customers')
    .select('id, name, handle')
    .eq('user_id', userId)
  if (custErr) throw new Error(`customers lookup: ${custErr.message}`)

  const { data: suppliers, error: supErr } = await supabase
    .from('suppliers')
    .select('id, name')
    .eq('user_id', userId)
  if (supErr) throw new Error(`suppliers lookup: ${supErr.message}`)

  const customerLookup = new Map(
    (customers || []).map((c) => [`${c.name.toLowerCase()}|${(c.handle || '').toLowerCase()}`, c.id])
  )
  const supplierLookup = new Map(
    (suppliers || []).map((s) => [s.name.toLowerCase(), s.id])
  )

  const orderRows = seedOrders.map((o) => {
    const name = (o.client || o.handle || '').trim()
    const handle = (o.handle || '').trim()
    const key = `${name.toLowerCase()}|${handle.toLowerCase()}`
    return {
      user_id: userId,
      seed_id: o.id,
      customer_id: customerLookup.get(key) || null,
      order_date: o.date || null,
      client: o.client || '',
      handle: o.handle || '',
      set_type: o.set || '',
      mapping: o.mapping || '',
      amount: o.amount || 0,
      period: o.period || '',
      notes: o.notes || '',
      status: o.status || 'completed',
    }
  })

  const expenseRows = seedExpenses.map((e) => ({
    user_id: userId,
    seed_id: e.id,
    supplier_id: supplierLookup.get(normalizeSupplierName(e.vendor).toLowerCase()) || null,
    expense_date: e.date || null,
    vendor: normalizeSupplierName(e.vendor),
    description: e.description || '',
    amount: e.amount || 0,
    period: e.period || '',
    notes: e.notes || '',
  }))

  if (counts.orders === 0) await write('orders', orderRows)
  if (counts.expenses === 0) await write('expenses', expenseRows)

  return {
    customers: customerRows.length,
    suppliers: supplierRows.length,
    orders: orderRows.length,
    expenses: expenseRows.length,
  }
}

export async function resetDatabase() {
  assertClient()
  const userId = await getUserId()

  await supabase.from('orders').delete().eq('user_id', userId)
  await supabase.from('expenses').delete().eq('user_id', userId)
  await supabase.from('customers').delete().eq('user_id', userId)
  await supabase.from('suppliers').delete().eq('user_id', userId)

  return seedDatabase()
}

export async function getCounts() {
  assertClient()
  const [ordersRes, expensesRes, customersRes, suppliersRes] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('expenses').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('suppliers').select('*', { count: 'exact', head: true }),
  ])

  if (ordersRes.error) throw ordersRes.error
  if (expensesRes.error) throw expensesRes.error

  return {
    orders: ordersRes.count || 0,
    expenses: expensesRes.count || 0,
    customers: customersRes.error ? 0 : (customersRes.count || 0),
    suppliers: suppliersRes.error ? 0 : (suppliersRes.count || 0),
  }
}
