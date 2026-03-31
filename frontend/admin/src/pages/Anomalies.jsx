import { useState, useEffect } from 'react'
import { supabase, DEMO_COMPANY_ID } from '../lib/supabase'
import { AlertTriangle, CheckCircle } from 'lucide-react'

const COMPANY_ID = DEMO_COMPANY_ID

const typeLabel = {
  theft: '🚨 Theft',
  leak: '💧 Leak',
  supplier_mismatch: '📦 Supplier Mismatch',
  sensor_offline: '📡 Sensor Offline',
  sensor_calibration: '⚙️ Sensor Calibration',
  unauthorized_drop: '🚫 Unauthorized Drop',
  low_level: '⚠️ Low Level',
}

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([])
  const [resolved, setResolved] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')

  useEffect(() => {
    load()
    const channel = supabase.channel('anomalies-page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'anomalies', filter: `company_id=eq.${COMPANY_ID}` },
        () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function load() {
    const [active, res] = await Promise.all([
      supabase.from('anomalies').select('*, tanks(name, fuel_type)')
        .eq('company_id', COMPANY_ID).eq('is_resolved', false)
        .order('detected_at', { ascending: false }),
      supabase.from('anomalies').select('*, tanks(name, fuel_type)')
        .eq('company_id', COMPANY_ID).eq('is_resolved', true)
        .order('resolved_at', { ascending: false }).limit(20),
    ])
    setAnomalies(active.data || [])
    setResolved(res.data || [])
    setLoading(false)
  }

  async function resolve(id) {
    await supabase.from('anomalies').update({
      is_resolved: true,
      resolution_notes: 'Resolved via admin dashboard',
      resolved_at: new Date().toISOString(),
    }).eq('id', id)
    load()
  }

  const list = tab === 'active' ? anomalies : resolved

  return (
    <div>
      <div className="page-header">
        <h1>Anomaly Log</h1>
        <p>Auto-detected anomalies from the triple-check reconciliation engine.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        <button className={`btn ${tab==='active' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('active')}>
          Active ({anomalies.length})
        </button>
        <button className={`btn ${tab==='resolved' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('resolved')}>
          Resolved ({resolved.length})
        </button>
      </div>

      {loading ? <div className="loading-spinner" /> : (
        list.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={40} style={{ margin:'0 auto 12px', display:'block', color:'var(--success)', opacity:0.5 }} />
            <p>{tab === 'active' ? '✅ No active anomalies — system healthy.' : 'No resolved anomalies.'}</p>
          </div>
        ) : (
          <div className="anomaly-list">
            {list.map(a => (
              <div key={a.id} className="anomaly-item">
                <div className={`anomaly-dot ${a.severity}`} />
                <div className="anomaly-body" style={{ flex: 1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <span className={`anomaly-badge ${a.severity}`}>{a.severity?.toUpperCase()}</span>
                      <span className="anomaly-title" style={{ marginLeft: 8, display:'inline' }}>
                        {typeLabel[a.type] || a.type}
                      </span>
                    </div>
                    {tab === 'active' && (
                      <button className="btn btn-success" style={{ padding:'4px 12px', fontSize:11 }} onClick={() => resolve(a.id)}>
                        <CheckCircle size={12} /> Resolve
                      </button>
                    )}
                  </div>
                  <div className="anomaly-desc" style={{ marginTop: 6 }}>{a.description}</div>
                  <div className="anomaly-meta">
                    <span>🛢 {a.tanks?.name}</span>
                    {a.volume_loss_liters && <span>📉 {Number(a.volume_loss_liters).toFixed(0)}L lost</span>}
                    {a.cost_impact && <span>💰 R{Number(a.cost_impact).toLocaleString('en-ZA', { minimumFractionDigits:2 })}</span>}
                    <span>🕐 {new Date(a.detected_at).toLocaleString('en-ZA')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
