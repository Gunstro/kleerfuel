import { useState, useEffect } from 'react'
import { supabase, DEMO_COMPANY_ID } from '../lib/supabase'
import { Fuel, RefreshCw } from 'lucide-react'

const COMPANY_ID = DEMO_COMPANY_ID

function fuelClass(type) {
  const m = { diesel:'diesel', petrol_95:'petrol_95', petrol_93:'petrol_93', adblue:'adblue', paraffin:'paraffin' }
  return m[type] || 'diesel'
}

function levelClass(pct, threshold) {
  if (pct <= threshold) return 'danger'
  if (pct <= threshold * 1.5) return 'warning'
  return 'ok'
}

function TankCard({ tank }) {
  const pct = Number(tank.capacity_liters) > 0
    ? (Number(tank.current_level_liters) / Number(tank.capacity_liters)) * 100
    : 0
  const threshold = Number(tank.alert_threshold_percent)
  const cls = levelClass(pct, threshold)
  const cardClass = cls === 'danger' ? 'critical' : cls === 'warning' ? 'warning-tank' : ''

  return (
    <div className={`tank-card ${cardClass}`}>
      <div className="tank-header">
        <div>
          <div className="tank-name">{tank.name}</div>
          <div className="tank-depot">{tank.depots?.name || 'No depot'} · {tank.iot_device_id || 'No IoT'}</div>
        </div>
        <span className={`fuel-badge ${fuelClass(tank.fuel_type)}`}>
          {tank.fuel_type?.replace(/_/g,' ')}
        </span>
      </div>

      <div className="tank-level-bar-wrap">
        <div className="tank-level-labels">
          <span>{pct.toFixed(1)}%</span>
          <span>Alert: {threshold}%</span>
        </div>
        <div className="tank-level-track">
          <div className={`tank-level-fill ${cls}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>

      <div className="tank-stats">
        <div>
          <div className="tank-stat-label">Current</div>
          <div className="tank-stat-value">{Number(tank.current_level_liters).toLocaleString('en-ZA')} L</div>
        </div>
        <div>
          <div className="tank-stat-label">Capacity</div>
          <div className="tank-stat-value">{Number(tank.capacity_liters).toLocaleString('en-ZA')} L</div>
        </div>
        <div>
          <div className="tank-stat-label">Cost/L</div>
          <div className="tank-stat-value">R{tank.cost_per_liter || '—'}</div>
        </div>
      </div>

      {tank.last_reading_at && (
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
          Last reading: {new Date(tank.last_reading_at).toLocaleString('en-ZA')}
        </div>
      )}
    </div>
  )
}

export default function Tanks() {
  const [tanks, setTanks] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('tanks').select('*, depots(name)')
      .eq('company_id', COMPANY_ID).eq('is_active', true).order('name')
    setTanks(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase.channel('tanks-page')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tanks', filter: `company_id=eq.${COMPANY_ID}` },
        () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Tanks</h1>
          <p>Live fuel levels across all depots. Updates in real-time via IoT.</p>
        </div>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? <div className="loading-spinner" /> : (
        tanks.length === 0 ? (
          <div className="empty-state">
            <Fuel size={40} style={{ margin: '0 auto 12px', display:'block', opacity:0.3 }} />
            <p>No tanks found. Add tanks via the admin panel.</p>
          </div>
        ) : (
          <div className="tanks-grid">
            {tanks.map(t => <TankCard key={t.id} tank={t} />)}
          </div>
        )
      )}
    </div>
  )
}
