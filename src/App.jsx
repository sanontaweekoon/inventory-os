import React, { useState, useMemo, useRef, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import {
  Upload, Download, Package, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Filter, Search, ChevronLeft, ChevronRight, RefreshCw,
  BarChart2, List, Eye
} from 'lucide-react'

// ─── Google Fonts ────────────────────────────────────────────────────────────
const fontStyle = document.createElement('style')
fontStyle.textContent = `@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap');`
document.head.appendChild(fontStyle)

// ─── Helper Functions ────────────────────────────────────────────────────────

function safeParseFloat(value) {
  if (value === null || value === undefined) return 0
  const str = String(value).replace(/,/g, '').trim()
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

function parseCustomDate(dateStr) {
  if (!dateStr) return null
  const s = String(dateStr).trim()

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (dmy) {
    const year = dmy[3].length === 2 ? 2000 + parseInt(dmy[3]) : parseInt(dmy[3])
    return new Date(year, parseInt(dmy[2]) - 1, parseInt(dmy[1]))
  }

  // YYYY-MM-DD
  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
  if (ymd) {
    return new Date(parseInt(ymd[1]), parseInt(ymd[2]) - 1, parseInt(ymd[3]))
  }

  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function getQtyValue(item) {
  if (item.currentStock !== undefined) return safeParseFloat(item.currentStock)
  if (item.qty !== undefined) return safeParseFloat(item.qty)
  if (item.quantity !== undefined) return safeParseFloat(item.quantity)
  return 0
}

function getShelfLifeInfo(item) {
  if (!item.expiryDate) return { daysLeft: null, status: 'no-expiry', label: 'ไม่มีวันหมดอายุ' }
  const expiry = parseCustomDate(item.expiryDate)
  if (!expiry) return { daysLeft: null, status: 'no-expiry', label: 'ไม่มีวันหมดอายุ' }
  const now = new Date()
  const diffMs = expiry.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return { daysLeft, status: 'expired', label: `หมดอายุ ${Math.abs(daysLeft)} วันที่แล้ว` }
  if (daysLeft <= 30) return { daysLeft, status: 'critical', label: `เหลือ ${daysLeft} วัน` }
  if (daysLeft <= 90) return { daysLeft, status: 'warning', label: `เหลือ ${daysLeft} วัน` }
  return { daysLeft, status: 'ok', label: `เหลือ ${daysLeft} วัน` }
}

function getAverageSales(item) {
  const total = safeParseFloat(item.totalSales || item.outboundQty || 0)
  const months = safeParseFloat(item.salesMonths || 3)
  return months > 0 ? total / months : 0
}

function getMovementStatus(item) {
  const avg = getAverageSales(item)
  const stock = getQtyValue(item)
  if (avg <= 0) return { status: 'slow', label: 'Slow Moving', color: '#ef4444' }
  const daysOfStock = (stock / avg) * 30
  if (daysOfStock > 180) return { status: 'slow', label: 'Slow Moving', color: '#ef4444' }
  if (daysOfStock > 90) return { status: 'medium', label: 'Medium Moving', color: '#f59e0b' }
  return { status: 'fast', label: 'Fast Moving', color: '#10b981' }
}

// ─── BrandLogo Component ──────────────────────────────────────────────────────

function BrandLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
      }}>
        <Package size={24} color="white" />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.5px' }}>
          Inventory <span style={{ color: '#6366f1' }}>OS</span>
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, marginTop: -2 }}>
          Master Management Hub
        </div>
      </div>
    </div>
  )
}

// ─── LargeStatCard Component ──────────────────────────────────────────────────

function LargeStatCard({ icon, title, value, subtitle, color, bgColor }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9',
      flex: 1,
      minWidth: 180
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: bgColor || '#f0f9ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {React.cloneElement(icon, { size: 26, color: color || '#0ea5e9' })}
      </div>
      <div>
        <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_DATA = [
  {
    id: 'P001',
    sku: 'SKU-001',
    name: 'Premium Widget A',
    category: 'Electronics',
    brand: 'BrandX',
    unit: 'pcs',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    costPrice: 120.00,
    sellPrice: 199.00,
    expiryDate: null,
    totalSales: 270,
    outboundQty: 270,
    inboundQty: 300,
    salesMonths: 3,
    location: 'A1-01',
    lastUpdated: '01/04/2024'
  },
  {
    id: 'P002',
    sku: 'SKU-002',
    name: 'Standard Gadget B',
    category: 'Accessories',
    brand: 'BrandY',
    unit: 'pcs',
    currentStock: 800,
    minStock: 100,
    maxStock: 1000,
    costPrice: 45.00,
    sellPrice: 89.00,
    expiryDate: null,
    totalSales: 60,
    outboundQty: 60,
    inboundQty: 200,
    salesMonths: 3,
    location: 'B2-05',
    lastUpdated: '01/04/2024'
  },
  {
    id: 'P003',
    sku: 'SKU-003',
    name: 'Organic Product C',
    category: 'Food',
    brand: 'BrandZ',
    unit: 'kg',
    currentStock: 30,
    minStock: 20,
    maxStock: 200,
    costPrice: 25.00,
    sellPrice: 49.00,
    expiryDate: '30/06/2024',
    totalSales: 360,
    outboundQty: 360,
    inboundQty: 400,
    salesMonths: 3,
    location: 'C3-10',
    lastUpdated: '01/04/2024'
  }
]

// ─── CSV Parser ────────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const values = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { inQuotes = !inQuotes }
      else if (ch === ',' && !inQuotes) { values.push(current.trim()); current = '' }
      else { current += ch }
    }
    values.push(current.trim())
    const obj = {}
    headers.forEach((h, i) => { obj[h] = values[i] || '' })
    return obj
  })
}

// ─── Main App Component ───────────────────────────────────────────────────────

export default function App() {
  const [data, setData] = useState(INITIAL_DATA)
  const [stockLoaded, setStockLoaded] = useState(false)
  const [outboundLoaded, setOutboundLoaded] = useState(false)
  const [inboundLoaded, setInboundLoaded] = useState(false)

  // Filters
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterBrand, setFilterBrand] = useState('all')
  const [filterMovement, setFilterMovement] = useState('all')
  const [filterShelfLife, setFilterShelfLife] = useState('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  // Movement analysis tab
  const [movementTab, setMovementTab] = useState('all')

  // Refs for file inputs
  const stockRef = useRef(null)
  const outboundRef = useRef(null)
  const inboundRef = useRef(null)

  // ── File Upload Handlers ──────────────────────────────────────────────────

  const handleStockUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result)
      if (rows.length === 0) return
      setData(rows.map((r, idx) => ({
        id: r.id || r.ID || r.sku || r.SKU || `ITEM-${idx + 1}`,
        sku: r.sku || r.SKU || r.code || r.Code || '',
        name: r.name || r.Name || r.productName || r.ProductName || r.product || '',
        category: r.category || r.Category || r.type || '',
        brand: r.brand || r.Brand || '',
        unit: r.unit || r.Unit || 'pcs',
        currentStock: safeParseFloat(r.currentStock || r.stock || r.qty || r.quantity || 0),
        minStock: safeParseFloat(r.minStock || r.min || 0),
        maxStock: safeParseFloat(r.maxStock || r.max || 0),
        costPrice: safeParseFloat(r.costPrice || r.cost || r.cost_price || 0),
        sellPrice: safeParseFloat(r.sellPrice || r.price || r.sell_price || 0),
        expiryDate: r.expiryDate || r.expiry || r.expiry_date || null,
        totalSales: 0,
        outboundQty: 0,
        inboundQty: 0,
        salesMonths: 3,
        location: r.location || r.Location || '',
        lastUpdated: r.lastUpdated || r.updatedAt || new Date().toLocaleDateString('th-TH')
      })))
      setStockLoaded(true)
      setOutboundLoaded(false)
      setInboundLoaded(false)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const handleOutboundUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result)
      if (rows.length === 0) return
      // Aggregate outbound by SKU/ID
      const outboundMap = {}
      rows.forEach(r => {
        const key = r.sku || r.SKU || r.id || r.ID || r.code || ''
        const qty = safeParseFloat(r.qty || r.quantity || r.outboundQty || 0)
        outboundMap[key] = (outboundMap[key] || 0) + qty
      })
      setData(prev => prev.map(item => {
        const key = item.sku || item.id
        const outbound = outboundMap[key] || 0
        return { ...item, outboundQty: outbound, totalSales: outbound }
      }))
      setOutboundLoaded(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const handleInboundUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result)
      if (rows.length === 0) return
      const inboundMap = {}
      rows.forEach(r => {
        const key = r.sku || r.SKU || r.id || r.ID || r.code || ''
        const qty = safeParseFloat(r.qty || r.quantity || r.inboundQty || 0)
        inboundMap[key] = (inboundMap[key] || 0) + qty
      })
      setData(prev => prev.map(item => {
        const key = item.sku || item.id
        const inbound = inboundMap[key] || 0
        return { ...item, inboundQty: inbound }
      }))
      setInboundLoaded(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  // ── Movement Analysis (useMemo) ───────────────────────────────────────────

  const movementAnalysis = useMemo(() => {
    const fast = data.filter(i => getMovementStatus(i).status === 'fast')
    const medium = data.filter(i => getMovementStatus(i).status === 'medium')
    const slow = data.filter(i => getMovementStatus(i).status === 'slow')
    return { fast, medium, slow, all: data }
  }, [data])

  const movementChartData = useMemo(() => [
    { name: 'Fast Moving', value: movementAnalysis.fast.length, color: '#10b981' },
    { name: 'Medium Moving', value: movementAnalysis.medium.length, color: '#f59e0b' },
    { name: 'Slow Moving', value: movementAnalysis.slow.length, color: '#ef4444' }
  ], [movementAnalysis])

  // ── Stock Analysis ────────────────────────────────────────────────────────

  const stockStats = useMemo(() => {
    const totalItems = data.length
    const totalStock = data.reduce((sum, i) => sum + getQtyValue(i), 0)
    const totalValue = data.reduce((sum, i) => sum + getQtyValue(i) * safeParseFloat(i.costPrice), 0)
    const lowStock = data.filter(i => {
      const qty = getQtyValue(i)
      const min = safeParseFloat(i.minStock)
      return min > 0 && qty <= min
    }).length
    const expiringSoon = data.filter(i => {
      const info = getShelfLifeInfo(i)
      return info.status === 'critical' || info.status === 'expired'
    }).length
    return { totalItems, totalStock, totalValue, lowStock, expiringSoon }
  }, [data])

  // ── Filter Options ────────────────────────────────────────────────────────

  const filterOptions = useMemo(() => {
    const categories = ['all', ...new Set(data.map(i => i.category).filter(Boolean))]
    const brands = ['all', ...new Set(data.map(i => i.brand).filter(Boolean))]
    return { categories, brands }
  }, [data])

  // ── Filtered Data ─────────────────────────────────────────────────────────

  const filteredData = useMemo(() => {
    let result = data

    if (searchText.trim()) {
      const q = searchText.toLowerCase()
      result = result.filter(i =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.sku || '').toLowerCase().includes(q) ||
        (i.id || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q) ||
        (i.brand || '').toLowerCase().includes(q)
      )
    }

    if (filterCategory !== 'all') {
      result = result.filter(i => i.category === filterCategory)
    }

    if (filterBrand !== 'all') {
      result = result.filter(i => i.brand === filterBrand)
    }

    if (filterMovement !== 'all') {
      result = result.filter(i => getMovementStatus(i).status === filterMovement)
    }

    if (filterShelfLife !== 'all') {
      result = result.filter(i => getShelfLifeInfo(i).status === filterShelfLife)
    }

    return result
  }, [data, searchText, filterCategory, filterBrand, filterMovement, filterShelfLife])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const pagedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // ── Export CSV ────────────────────────────────────────────────────────────

  function exportCSV() {
    const headers = ['ID', 'SKU', 'Name', 'Category', 'Brand', 'Unit', 'Stock', 'Min Stock',
      'Max Stock', 'Cost Price', 'Sell Price', 'Expiry Date', 'Outbound Qty', 'Inbound Qty',
      'Movement Status', 'Location']
    const rows = filteredData.map(i => [
      i.id, i.sku, i.name, i.category, i.brand, i.unit,
      getQtyValue(i), i.minStock, i.maxStock, i.costPrice, i.sellPrice,
      i.expiryDate || '', i.outboundQty || 0, i.inboundQty || 0,
      getMovementStatus(i).label, i.location
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Movement Tab Data ─────────────────────────────────────────────────────

  const movementTabData = movementTab === 'all' ? movementAnalysis.all
    : movementTab === 'fast' ? movementAnalysis.fast
      : movementTab === 'medium' ? movementAnalysis.medium
        : movementAnalysis.slow

  // ── Styles ─────────────────────────────────────────────────────────────────

  const s = {
    app: {
      fontFamily: "'Sarabun', sans-serif",
      background: '#f8fafc',
      minHeight: '100vh',
      color: '#1e293b'
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    },
    uploadBtn: (loaded, color) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 16px',
      borderRadius: 10,
      border: `1px solid ${loaded ? color : '#e2e8f0'}`,
      background: loaded ? `${color}15` : 'white',
      color: loaded ? color : '#374151',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontFamily: "'Sarabun', sans-serif"
    }),
    main: {
      maxWidth: 1600,
      margin: '0 auto',
      padding: '24px 24px'
    },
    statsRow: {
      display: 'flex',
      gap: 16,
      marginBottom: 24,
      flexWrap: 'wrap'
    },
    section: {
      background: 'white',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      border: '1px solid #f1f5f9'
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: 700,
      color: '#111827',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    },
    tabBar: {
      display: 'flex',
      gap: 4,
      marginBottom: 16,
      background: '#f8fafc',
      padding: 4,
      borderRadius: 10,
      width: 'fit-content'
    },
    tab: (active, color) => ({
      padding: '6px 18px',
      borderRadius: 8,
      border: 'none',
      background: active ? 'white' : 'transparent',
      color: active ? (color || '#6366f1') : '#6b7280',
      fontWeight: active ? 700 : 500,
      fontSize: 13,
      cursor: 'pointer',
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.15s',
      fontFamily: "'Sarabun', sans-serif"
    }),
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    },
    th: {
      padding: '10px 12px',
      textAlign: 'left',
      background: '#f8fafc',
      color: '#374151',
      fontWeight: 700,
      borderBottom: '2px solid #e2e8f0',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '10px 12px',
      borderBottom: '1px solid #f1f5f9',
      color: '#374151'
    },
    badge: (color, bg) => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      color,
      background: bg
    }),
    filterRow: {
      display: 'flex',
      gap: 12,
      marginBottom: 16,
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    input: {
      padding: '8px 12px',
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      fontSize: 13,
      fontFamily: "'Sarabun', sans-serif",
      outline: 'none',
      background: 'white',
      color: '#374151'
    },
    select: {
      padding: '8px 12px',
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      fontSize: 13,
      fontFamily: "'Sarabun', sans-serif",
      outline: 'none',
      background: 'white',
      color: '#374151',
      cursor: 'pointer'
    },
    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingTop: 16,
      borderTop: '1px solid #f1f5f9'
    },
    pageBtn: (active) => ({
      width: 34,
      height: 34,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      border: active ? 'none' : '1px solid #e2e8f0',
      background: active ? '#6366f1' : 'white',
      color: active ? 'white' : '#374151',
      fontWeight: active ? 700 : 500,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: "'Sarabun', sans-serif"
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={s.app}>
      {/* Hidden file inputs */}
      <input ref={stockRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleStockUpload} />
      <input ref={outboundRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleOutboundUpload} />
      <input ref={inboundRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleInboundUpload} />

      {/* ── Header ── */}
      <header style={s.header}>
        <BrandLogo />
        <div style={s.headerRight}>
          <button style={s.uploadBtn(stockLoaded, '#6366f1')} onClick={() => stockRef.current?.click()}>
            <Upload size={15} />
            Stock {stockLoaded && <CheckCircle size={13} />}
          </button>
          <button style={s.uploadBtn(outboundLoaded, '#f59e0b')} onClick={() => outboundRef.current?.click()}>
            <TrendingDown size={15} />
            Outbound {outboundLoaded && <CheckCircle size={13} />}
          </button>
          <button style={s.uploadBtn(inboundLoaded, '#10b981')} onClick={() => inboundRef.current?.click()}>
            <TrendingUp size={15} />
            Inbound {inboundLoaded && <CheckCircle size={13} />}
          </button>
          <button
            style={{ ...s.uploadBtn(false, '#6366f1'), background: '#6366f1', color: 'white', border: 'none' }}
            onClick={exportCSV}
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={s.main}>

        {/* ── Stats Row ── */}
        <div style={s.statsRow}>
          <LargeStatCard
            icon={<Package />}
            title="Total SKUs"
            value={stockStats.totalItems.toLocaleString()}
            subtitle="สินค้าทั้งหมด"
            color="#6366f1"
            bgColor="#eef2ff"
          />
          <LargeStatCard
            icon={<BarChart2 />}
            title="Total Stock"
            value={stockStats.totalStock.toLocaleString()}
            subtitle="จำนวนคงเหลือรวม"
            color="#0ea5e9"
            bgColor="#f0f9ff"
          />
          <LargeStatCard
            icon={<TrendingUp />}
            title="Total Value"
            value={`฿${(stockStats.totalValue / 1000).toFixed(1)}K`}
            subtitle="มูลค่าสินค้าคงเหลือ"
            color="#10b981"
            bgColor="#f0fdf4"
          />
          <LargeStatCard
            icon={<AlertTriangle />}
            title="Low Stock"
            value={stockStats.lowStock}
            subtitle="ต่ำกว่า minimum"
            color="#ef4444"
            bgColor="#fef2f2"
          />
          <LargeStatCard
            icon={<RefreshCw />}
            title="Expiring Soon"
            value={stockStats.expiringSoon}
            subtitle="หมดอายุใน 30 วัน"
            color="#f59e0b"
            bgColor="#fffbeb"
          />
        </div>

        {/* ── Movement Analysis Section ── */}
        <div style={s.section}>
          <div style={s.sectionTitle}>
            <BarChart2 size={20} color="#6366f1" />
            Movement Analysis
          </div>

          {/* Movement summary cards */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Fast Moving', count: movementAnalysis.fast.length, color: '#10b981', bg: '#f0fdf4' },
              { label: 'Medium Moving', count: movementAnalysis.medium.length, color: '#f59e0b', bg: '#fffbeb' },
              { label: 'Slow Moving', count: movementAnalysis.slow.length, color: '#ef4444', bg: '#fef2f2' }
            ].map(m => (
              <div key={m.label} style={{
                padding: '12px 20px', borderRadius: 12, background: m.bg,
                border: `1px solid ${m.color}30`, flex: 1, minWidth: 160
              }}>
                <div style={{ fontSize: 13, color: m.color, fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.count}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  {data.length > 0 ? `${((m.count / data.length) * 100).toFixed(1)}%` : '0%'} of total
                </div>
              </div>
            ))}
          </div>

          {/* Chart + table tabs */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {/* Pie chart */}
            <div style={{ flex: '0 0 220px' }}>
              <ResponsiveContainer width={220} height={200}>
                <PieChart>
                  <Pie
                    data={movementChartData}
                    cx={110} cy={90}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${value}` : ''}
                  >
                    {movementChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Movement table */}
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={s.tabBar}>
                {[
                  { key: 'all', label: `All (${data.length})` },
                  { key: 'fast', label: `Fast (${movementAnalysis.fast.length})` },
                  { key: 'medium', label: `Medium (${movementAnalysis.medium.length})` },
                  { key: 'slow', label: `Slow (${movementAnalysis.slow.length})` }
                ].map(t => (
                  <button key={t.key} style={s.tab(movementTab === t.key)} onClick={() => setMovementTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div style={{ overflowX: 'auto', maxHeight: 260, overflowY: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>SKU</th>
                      <th style={s.th}>Name</th>
                      <th style={s.th}>Stock</th>
                      <th style={s.th}>Avg Sales/mo</th>
                      <th style={s.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movementTabData.slice(0, 50).map((item, idx) => {
                      const mv = getMovementStatus(item)
                      const avg = getAverageSales(item)
                      return (
                        <tr key={item.id || idx} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={s.td}>{item.sku || item.id}</td>
                          <td style={s.td}>{item.name}</td>
                          <td style={s.td}>{getQtyValue(item).toLocaleString()} {item.unit}</td>
                          <td style={s.td}>{avg.toFixed(1)}</td>
                          <td style={s.td}>
                            <span style={s.badge(mv.color, `${mv.color}15`)}>
                              {mv.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {movementTabData.length === 0 && (
                      <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#9ca3af' }}>No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── Inventory Table Section ── */}
        <div style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={s.sectionTitle}>
              <List size={20} color="#6366f1" />
              Inventory Detail
              <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', marginLeft: 4 }}>
                ({filteredData.length} รายการ)
              </span>
            </div>
          </div>

          {/* Filters */}
          <div style={s.filterRow}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                style={{ ...s.input, paddingLeft: 32, width: 260 }}
                placeholder="ค้นหา SKU, ชื่อ, หมวด..."
                value={searchText}
                onChange={e => { setSearchText(e.target.value); setCurrentPage(1) }}
              />
            </div>
            <select style={s.select} value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1) }}>
              {filterOptions.categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
            <select style={s.select} value={filterBrand} onChange={e => { setFilterBrand(e.target.value); setCurrentPage(1) }}>
              {filterOptions.brands.map(b => (
                <option key={b} value={b}>{b === 'all' ? 'All Brands' : b}</option>
              ))}
            </select>
            <select style={s.select} value={filterMovement} onChange={e => { setFilterMovement(e.target.value); setCurrentPage(1) }}>
              <option value="all">All Movement</option>
              <option value="fast">Fast Moving</option>
              <option value="medium">Medium Moving</option>
              <option value="slow">Slow Moving</option>
            </select>
            <select style={s.select} value={filterShelfLife} onChange={e => { setFilterShelfLife(e.target.value); setCurrentPage(1) }}>
              <option value="all">All Shelf Life</option>
              <option value="ok">OK (&gt;90 days)</option>
              <option value="warning">Warning (30-90 days)</option>
              <option value="critical">Critical (&lt;30 days)</option>
              <option value="expired">Expired</option>
              <option value="no-expiry">No Expiry</option>
            </select>
            {(searchText || filterCategory !== 'all' || filterBrand !== 'all' || filterMovement !== 'all' || filterShelfLife !== 'all') && (
              <button
                style={{ ...s.uploadBtn(false, '#6366f1'), fontSize: 12 }}
                onClick={() => {
                  setSearchText('')
                  setFilterCategory('all')
                  setFilterBrand('all')
                  setFilterMovement('all')
                  setFilterShelfLife('all')
                  setCurrentPage(1)
                }}
              >
                <RefreshCw size={13} /> Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>#</th>
                  <th style={s.th}>SKU</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Brand</th>
                  <th style={s.th}>Stock</th>
                  <th style={s.th}>Min/Max</th>
                  <th style={s.th}>Cost</th>
                  <th style={s.th}>Price</th>
                  <th style={s.th}>Outbound</th>
                  <th style={s.th}>Inbound</th>
                  <th style={s.th}>Expiry</th>
                  <th style={s.th}>Movement</th>
                  <th style={s.th}>Location</th>
                </tr>
              </thead>
              <tbody>
                {pagedData.map((item, idx) => {
                  const mv = getMovementStatus(item)
                  const shelf = getShelfLifeInfo(item)
                  const rowNum = (currentPage - 1) * pageSize + idx + 1
                  const isLowStock = safeParseFloat(item.minStock) > 0 && getQtyValue(item) <= safeParseFloat(item.minStock)
                  return (
                    <tr key={item.id || idx} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ ...s.td, color: '#9ca3af' }}>{rowNum}</td>
                      <td style={{ ...s.td, fontWeight: 600, color: '#6366f1' }}>{item.sku || item.id}</td>
                      <td style={{ ...s.td, maxWidth: 200 }}>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                      </td>
                      <td style={s.td}>{item.category || '-'}</td>
                      <td style={s.td}>{item.brand || '-'}</td>
                      <td style={{ ...s.td, fontWeight: 700, color: isLowStock ? '#ef4444' : '#111827' }}>
                        {getQtyValue(item).toLocaleString()} {item.unit}
                        {isLowStock && <span style={{ marginLeft: 4 }}><AlertTriangle size={12} color="#ef4444" /></span>}
                      </td>
                      <td style={{ ...s.td, color: '#6b7280', fontSize: 12 }}>
                        {safeParseFloat(item.minStock)}/{safeParseFloat(item.maxStock)}
                      </td>
                      <td style={s.td}>
                        {safeParseFloat(item.costPrice) > 0 ? `฿${safeParseFloat(item.costPrice).toLocaleString()}` : '-'}
                      </td>
                      <td style={s.td}>
                        {safeParseFloat(item.sellPrice) > 0 ? `฿${safeParseFloat(item.sellPrice).toLocaleString()}` : '-'}
                      </td>
                      <td style={{ ...s.td, color: '#f59e0b', fontWeight: 600 }}>
                        {safeParseFloat(item.outboundQty) > 0 ? safeParseFloat(item.outboundQty).toLocaleString() : '-'}
                      </td>
                      <td style={{ ...s.td, color: '#10b981', fontWeight: 600 }}>
                        {safeParseFloat(item.inboundQty) > 0 ? safeParseFloat(item.inboundQty).toLocaleString() : '-'}
                      </td>
                      <td style={s.td}>
                        {shelf.status !== 'no-expiry' ? (
                          <span style={s.badge(
                            shelf.status === 'expired' ? '#ef4444'
                              : shelf.status === 'critical' ? '#f59e0b'
                                : shelf.status === 'warning' ? '#f59e0b'
                                  : '#10b981',
                            shelf.status === 'expired' ? '#fef2f2'
                              : shelf.status === 'critical' ? '#fffbeb'
                                : shelf.status === 'warning' ? '#fffbeb'
                                  : '#f0fdf4'
                          )}>
                            {shelf.label}
                          </span>
                        ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>-</span>}
                      </td>
                      <td style={s.td}>
                        <span style={s.badge(mv.color, `${mv.color}15`)}>
                          {mv.label}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: '#6b7280', fontSize: 12 }}>{item.location || '-'}</td>
                    </tr>
                  )
                })}
                {pagedData.length === 0 && (
                  <tr>
                    <td colSpan={14} style={{ ...s.td, textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                      <Package size={32} style={{ display: 'block', margin: '0 auto 8px' }} />
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={s.pagination}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              แสดง {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)}–{Math.min(currentPage * pageSize, filteredData.length)} จาก {filteredData.length} รายการ
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                style={s.pageBtn(false)}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let page
                if (totalPages <= 7) {
                  page = i + 1
                } else if (currentPage <= 4) {
                  page = i + 1
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i
                } else {
                  page = currentPage - 3 + i
                }
                return (
                  <button key={page} style={s.pageBtn(page === currentPage)} onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>
                )
              })}
              <button
                style={s.pageBtn(false)}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
