import { useState, useEffect, useCallback, useMemo } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import * as db from '../lib/db'

const STORAGE_KEY = 'lash-finance-data'

function loadLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return { orders: [], expenses: [], inventory: [] }
}

function saveLocalData(orders, expenses, inventory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ orders, expenses, inventory }))
}

function computeCustomersFromOrders(orders) {
  const map = orders.reduce((acc, o) => {
    const key = o.client || o.handle || 'Unknown'
    if (!acc[key]) {
      acc[key] = { id: key, name: o.client || key, handle: o.handle || '', orders: [], totalSpent: 0, orderCount: 0 }
    }
    if (o.handle && !acc[key].handle) acc[key].handle = o.handle
    acc[key].orders.push(o)
    acc[key].totalSpent += o.amount || 0
    acc[key].orderCount += 1
    return acc
  }, {})
  return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent)
}

function computeDerived(orders, expenses) {
  const totalRevenue = orders.reduce((s, o) => s + (o.amount || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const balance = totalRevenue - totalExpenses

  const revenueByMonth = orders.reduce((map, o) => {
    if (!o.date) return map
    const month = o.date.slice(0, 7)
    map[month] = (map[month] || 0) + o.amount
    return map
  }, {})

  const expensesByMonth = expenses.reduce((map, e) => {
    if (!e.date) return map
    const month = e.date.slice(0, 7)
    map[month] = (map[month] || 0) + e.amount
    return map
  }, {})

  const setBreakdown = orders.reduce((map, o) => {
    const set = o.set || 'Unspecified'
    map[set] = (map[set] || 0) + 1
    return map
  }, {})

  return { totalRevenue, totalExpenses, balance, revenueByMonth, expensesByMonth, setBreakdown }
}

export function useFinanceStore(enabled = true) {
  const [orders, setOrders] = useState([])
  const [expenses, setExpenses] = useState([])
  const [customerRecords, setCustomerRecords] = useState([])
  const [supplierRecords, setSupplierRecords] = useState([])
  const [inventoryRecords, setInventoryRecords] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured && enabled)
  const [error, setError] = useState(null)
  const [storageMode, setStorageMode] = useState(isSupabaseConfigured ? 'supabase' : null)

  const loadFromSupabase = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      await db.mergeAllKnownSupplierDuplicates()
      const [orderData, expenseData, customerData, supplierData, inventoryData] = await Promise.all([
        db.fetchOrders(),
        db.fetchExpenses(),
        db.fetchCustomers().catch(() => []),
        db.fetchSuppliers().catch(() => []),
        db.fetchInventory().catch(() => []),
      ])
      setOrders(orderData)
      setExpenses(expenseData)
      setCustomerRecords(customerData)
      setSupplierRecords(supplierData)
      setInventoryRecords(inventoryData)
      setStorageMode('supabase')
    } catch (err) {
      setError(err.message || 'Failed to load from Supabase')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  const loadFromLocal = useCallback(() => {
    const data = loadLocalData()
    setOrders(data.orders)
    setExpenses(data.expenses)
    setCustomerRecords([])
    setSupplierRecords([])
    setInventoryRecords(data.inventory || [])
    setStorageMode('local')
    setLoading(false)
    setError(null)
  }, [])

  useEffect(() => {
    if (!enabled) return
    if (isSupabaseConfigured) {
      loadFromSupabase()
    } else {
      setLoading(false)
    }
  }, [enabled, loadFromSupabase])

  useEffect(() => {
    if (storageMode === 'local') {
      saveLocalData(orders, expenses, inventoryRecords)
    }
  }, [orders, expenses, inventoryRecords, storageMode])

  const addOrder = useCallback(async (order) => {
    if (storageMode === 'supabase') {
      const created = await db.insertOrder(order)
      setOrders((prev) => [created, ...prev])
      await loadFromSupabase()
      return created
    }
    const created = { ...order, id: `o${Date.now()}` }
    setOrders((prev) => [created, ...prev])
    return created
  }, [storageMode, loadFromSupabase])

  const updateOrder = useCallback(async (id, updates) => {
    if (storageMode === 'supabase') {
      const updated = await db.updateOrder(id, updates)
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
      await loadFromSupabase()
      return updated
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
  }, [storageMode, loadFromSupabase])

  const deleteOrder = useCallback(async (id) => {
    if (storageMode === 'supabase') await db.deleteOrder(id)
    setOrders((prev) => prev.filter((o) => o.id !== id))
    if (storageMode === 'supabase') await loadFromSupabase()
  }, [storageMode, loadFromSupabase])

  const addExpense = useCallback(async (expense) => {
    if (storageMode === 'supabase') {
      const created = await db.insertExpense(expense)
      setExpenses((prev) => [created, ...prev])
      await loadFromSupabase()
      return created
    }
    const created = { ...expense, id: `e${Date.now()}` }
    setExpenses((prev) => [created, ...prev])
    return created
  }, [storageMode, loadFromSupabase])

  const updateExpense = useCallback(async (id, updates) => {
    if (storageMode === 'supabase') {
      const updated = await db.updateExpense(id, updates)
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
      await loadFromSupabase()
      return updated
    }
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
  }, [storageMode, loadFromSupabase])

  const deleteExpense = useCallback(async (id) => {
    if (storageMode === 'supabase') await db.deleteExpense(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    if (storageMode === 'supabase') await loadFromSupabase()
  }, [storageMode, loadFromSupabase])

  const fetchCustomerOrders = useCallback(async (customerId) => {
    if (storageMode === 'supabase' && customerId) {
      return db.fetchCustomerOrders(customerId)
    }
    return []
  }, [storageMode])

  const fetchSupplierExpenses = useCallback(async (supplierId) => {
    if (storageMode === 'supabase' && supplierId) {
      return db.fetchSupplierExpenses(supplierId)
    }
    return []
  }, [storageMode])

  const updateCustomer = useCallback(async (id, updates) => {
    if (storageMode === 'supabase') {
      await db.updateCustomer(id, updates)
      await loadFromSupabase()
      return
    }
    setCustomerRecords((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }, [storageMode, loadFromSupabase])

  const addCustomer = useCallback(async (customer) => {
    if (storageMode === 'supabase') {
      const created = await db.insertCustomer(customer)
      await loadFromSupabase()
      return created
    }
    const created = { ...customer, id: `c${Date.now()}`, orderCount: 0, totalSpent: 0 }
    setCustomerRecords((prev) => [created, ...prev])
    return created
  }, [storageMode, loadFromSupabase])

  const deleteCustomer = useCallback(async (id) => {
    if (storageMode === 'supabase') {
      await db.deleteCustomer(id)
      await loadFromSupabase()
      return
    }
    setCustomerRecords((prev) => prev.filter((c) => c.id !== id))
  }, [storageMode, loadFromSupabase])

  const updateSupplier = useCallback(async (id, updates) => {
    if (storageMode === 'supabase') {
      await db.updateSupplier(id, updates)
      await loadFromSupabase()
      return
    }
    setSupplierRecords((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [storageMode, loadFromSupabase])

  const addSupplier = useCallback(async (supplier) => {
    if (storageMode === 'supabase') {
      const created = await db.insertSupplier(supplier)
      await loadFromSupabase()
      return created
    }
    const created = { ...supplier, id: `s${Date.now()}`, purchaseCount: 0, totalSpent: 0 }
    setSupplierRecords((prev) => [created, ...prev])
    return created
  }, [storageMode, loadFromSupabase])

  const addInventoryItem = useCallback(async (item) => {
    if (storageMode === 'supabase') {
      const created = await db.insertInventoryItem(item)
      await loadFromSupabase()
      return created
    }
    const created = { ...item, id: `i${Date.now()}`, orderCount: 0, totalRevenue: 0 }
    setInventoryRecords((prev) => [created, ...prev])
    return created
  }, [storageMode, loadFromSupabase])

  const updateInventoryItem = useCallback(async (id, updates) => {
    if (storageMode === 'supabase') {
      await db.updateInventoryItem(id, updates)
      await loadFromSupabase()
      return
    }
    setInventoryRecords((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
  }, [storageMode, loadFromSupabase])

  const deleteInventoryItem = useCallback(async (id) => {
    if (storageMode === 'supabase') {
      await db.deleteInventoryItem(id)
      await loadFromSupabase()
      return
    }
    setInventoryRecords((prev) => prev.filter((i) => i.id !== id))
  }, [storageMode, loadFromSupabase])

  const fetchInventoryOrders = useCallback(async (setName) => {
    if (storageMode === 'supabase' && setName) {
      return db.fetchInventoryOrders(setName)
    }
    return orders.filter((o) => o.set === setName)
  }, [storageMode, orders])

  const derived = useMemo(() => computeDerived(orders, expenses), [orders, expenses])

  const customers = storageMode === 'supabase' && customerRecords.length
    ? customerRecords.map((c) => ({
        ...c,
        orders: orders.filter((o) => o.customerId === c.id),
        totalSpent: c.totalSpent ?? orders.filter((o) => o.customerId === c.id).reduce((s, o) => s + o.amount, 0),
        orderCount: c.orderCount ?? orders.filter((o) => o.customerId === c.id).length,
      }))
    : computeCustomersFromOrders(orders)

  return {
    orders,
    expenses,
    loading,
    error,
    storageMode,
    isSupabaseConfigured,
    loadFromSupabase,
    loadFromLocal,
    addOrder,
    updateOrder,
    deleteOrder,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchCustomerOrders,
    fetchSupplierExpenses,
    updateCustomer,
    addCustomer,
    deleteCustomer,
    updateSupplier,
    addSupplier,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    fetchInventoryOrders,
    customers,
    inventory: inventoryRecords.length
      ? inventoryRecords.map((item) => ({
          ...item,
          orderCount: item.orderCount ?? orders.filter((o) => o.set === item.name).length,
          totalRevenue: item.totalRevenue ?? orders.filter((o) => o.set === item.name).reduce((s, o) => s + o.amount, 0),
        }))
      : [],
    suppliers: supplierRecords.length
      ? supplierRecords
      : [...new Set(expenses.map((e) => e.vendor).filter(Boolean))].map((name) => ({
          id: name,
          name,
          totalSpent: expenses.filter((e) => e.vendor === name).reduce((s, e) => s + e.amount, 0),
          purchaseCount: expenses.filter((e) => e.vendor === name).length,
        })),
    ...derived,
  }
}
