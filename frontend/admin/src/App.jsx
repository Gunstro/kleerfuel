import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tanks from './pages/Tanks'
import IoTPanel from './pages/IoTPanel'
import Anomalies from './pages/Anomalies'
import Sidebar from './components/Sidebar'
import ComingSoon from './components/ComingSoon'
import './index.css'

// ── Page registry ─────────────────────────────────────────────────────────────
const PAGES = {
  // Live Ops (built)
  dashboard:  <Dashboard />,
  tanks:      <Tanks />,
  anomalies:  <Anomalies />,
  iot:        <IoTPanel />,

  // Fleet
  drivers:        <ComingSoon title="Drivers"       description="Manage driver profiles, license details and employee records." />,
  vehicles:       <ComingSoon title="Vehicles"      description="Fleet management — trucks, bakkies, generators and equipment." />,
  'vehicle-types':<ComingSoon title="Vehicle Types" description="Define and manage custom vehicle categories for your fleet." />,

  // Operations Setup
  'tanks-admin':  <ComingSoon title="Tanks (Admin)" description="Create and configure tanks, IoT device bindings, and alert thresholds." />,
  depots:         <ComingSoon title="Depots"        description="Manage your depot locations, GPS coordinates and operating zones." />,
  suppliers:      <ComingSoon title="Suppliers"     description="Supplier database — contacts, account numbers and preferred suppliers." />,
  agreements:     <ComingSoon title="Agreements"    description="Supplier pricing agreements, fuel types, validity periods and lead times." />,

  // Operations (PWA-linked)
  refuel:         <ComingSoon title="Refuel Vehicle"    description="Log vehicle refuels — scan QR, capture odometer via OCR, select tank." />,
  refill:         <ComingSoon title="Refill Tank"       description="Record tank deliveries, capture invoice OCR, validate against IoT increase." />,
  'manual-dip':   <ComingSoon title="Manual Dip Entry"  description="Enter physical dip readings as a third reconciliation input." />,
  recon:          <ComingSoon title="Reconciliation"    description="Triple-check engine: IoT delta vs transactions vs manual dip." />,

  // Reports
  'report-vehicles':   <ComingSoon title="Vehicles Report"         description="Fuel consumption per vehicle, km-per-litre trends and SARS rebate export." />,
  'report-tanks':      <ComingSoon title="Tanks Report"            description="Tank level history, consumption trends and refill predictions." />,
  'report-users':      <ComingSoon title="Users Report"            description="User activity log, access audit and role summary." />,
  'report-depots':     <ComingSoon title="Depots Report"           description="Depot-level fuel flow summary and inventory overview." />,
  'report-suppliers':  <ComingSoon title="Suppliers Report"        description="Supplier accuracy: delivered vs IoT-measured volume comparison." />,
  'report-agreements': <ComingSoon title="Agreements Report"       description="Agreement compliance, pricing variance and contract expiry tracking." />,
  'report-billing':    <ComingSoon title="Subscription / Billing"  description="Month-end billing summary, invoice history and plan usage." />,

  // System
  users:        <ComingSoon title="Users"           description="Manage user accounts, assign roles (Admin, Ops, Viewer) and configure access." />,
  currency:     <ComingSoon title="Currency"        description="Set default currency and configure fuel cost-per-litre for cost tracking." />,
  company:      <ComingSoon title="Company Details" description="Update your company profile, VAT number, contact details and logo." />,
  subscription: <ComingSoon title="Subscription"   description="View your current plan, usage limits and upgrade options." />,

  // SaaS Admin (Super Admin only)
  'saas-clients':       <ComingSoon title="Clients"        description="Manage tenant companies — create, suspend, or configure client accounts." />,
  'saas-subscriptions': <ComingSoon title="Subscriptions"  description="Overview of all active subscription plans across all tenants." />,
  'saas-billing':       <ComingSoon title="Billing"        description="Invoice management, payment tracking and revenue overview." />,
  'saas-users':         <ComingSoon title="SaaS Users"     description="Platform-level user management across all client tenants." />,
  'saas-agreements':    <ComingSoon title="SaaS Agreements"description="Platform-wide supplier agreement templates and pricing structures." />,
  'saas-currency':      <ComingSoon title="Currency API"   description="Configure live exchange rate API sources for multi-currency support." />,
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="loading-spinner" />
    </div>
  )

  if (!session) return <Login />

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} session={session} />
      <main className="main-content">
        {PAGES[page] ?? <Dashboard />}
      </main>
    </div>
  )
}
