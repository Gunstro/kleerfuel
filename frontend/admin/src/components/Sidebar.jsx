import { useState } from 'react'
import {
  LayoutDashboard,
  Fuel,
  Cpu,
  AlertTriangle,
  LogOut,
  Settings,
  Users,
  Truck,
  UserCheck,
  Car,
  Building2,
  PackageSearch,
  Handshake,
  DollarSign,
  BadgeInfo,
  CreditCard,
  Droplets,
  ClipboardList,
  BarChart3,
  Globe,
  ChevronDown,
  ChevronRight,
  Gauge,
  FileBarChart,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const NAV = [
  {
    section: 'LIVE OPS',
    items: [
      { id: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'tanks',      icon: Fuel,            label: 'Tanks' },
      { id: 'anomalies',  icon: AlertTriangle,   label: 'Anomaly Log' },
      { id: 'iot',        icon: Cpu,             label: 'IoT Simulator' },
    ],
  },
  {
    section: 'FLEET',
    items: [
      { id: 'drivers',       icon: UserCheck,    label: 'Drivers' },
      { id: 'vehicles',      icon: Truck,        label: 'Vehicles' },
      { id: 'vehicle-types', icon: Car,          label: 'Vehicle Types' },
    ],
  },
  {
    section: 'OPERATIONS SETUP',
    items: [
      { id: 'depots',      icon: Building2,     label: 'Depots' },
      { id: 'tanks-admin', icon: Fuel,          label: 'Tanks' },
      { id: 'suppliers',   icon: PackageSearch, label: 'Suppliers' },
      { id: 'agreements',  icon: Handshake,     label: 'Agreements' },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { id: 'refuel',     icon: Gauge,         label: 'Refuel Vehicle' },
      { id: 'refill',     icon: Droplets,      label: 'Refill Tank' },
      { id: 'manual-dip', icon: ClipboardList, label: 'Manual Dip' },
      { id: 'recon',      icon: BarChart3,     label: 'Reconciliation' },
    ],
  },
  {
    section: 'REPORTS',
    items: [
      { id: 'report-vehicles',    icon: FileBarChart, label: 'Vehicles' },
      { id: 'report-tanks',       icon: FileBarChart, label: 'Tanks' },
      { id: 'report-users',       icon: FileBarChart, label: 'Users' },
      { id: 'report-depots',      icon: FileBarChart, label: 'Depots' },
      { id: 'report-suppliers',   icon: FileBarChart, label: 'Suppliers' },
      { id: 'report-agreements',  icon: FileBarChart, label: 'Agreements' },
      { id: 'report-billing',     icon: FileBarChart, label: 'Subscription/Billing' },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { id: 'users',        icon: Users,     label: 'Users' },
      { id: 'currency',     icon: DollarSign,label: 'Currency' },
      { id: 'company',      icon: BadgeInfo, label: 'Company Details' },
      { id: 'subscription', icon: CreditCard,label: 'Subscription' },
    ],
  },
  {
    section: 'SAAS ADMIN',
    items: [
      { id: 'saas-clients',       icon: Globe,        label: 'Clients' },
      { id: 'saas-subscriptions', icon: CreditCard,   label: 'Subscriptions' },
      { id: 'saas-billing',       icon: DollarSign,   label: 'Billing' },
      { id: 'saas-users',         icon: Users,        label: 'Users' },
      { id: 'saas-agreements',    icon: Handshake,    label: 'Agreements' },
      { id: 'saas-currency',      icon: DollarSign,   label: 'Currency API' },
    ],
  },
]

export default function Sidebar({ page, setPage, session }) {
  // Start with Live Ops open, rest collapsed
  const [open, setOpen] = useState({
    'LIVE OPS': true,
    'FLEET': false,
    'OPERATIONS SETUP': false,
    'OPERATIONS': false,
    'REPORTS': false,
    'SYSTEM': false,
    'SAAS ADMIN': false,
  })

  const toggle = (section) =>
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }))

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">
          <span className="logo-kleer">kleer</span><span className="logo-fuel">FUEL</span>
        </div>
        <div className="logo-tag">Total Fuel Visibility</div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ section, items }) => (
          <div key={section} className="nav-group">
            <button
              className="nav-section-toggle"
              onClick={() => toggle(section)}
            >
              <span className="nav-section-label">{section}</span>
              {open[section]
                ? <ChevronDown size={11} />
                : <ChevronRight size={11} />
              }
            </button>

            {open[section] && items.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                className={`nav-item ${page === id ? 'active' : ''}`}
                onClick={() => setPage(id)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-email">
          {session?.user?.email}
        </div>
        <button className="nav-item signout-btn" onClick={() => supabase.auth.signOut()}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  )
}
