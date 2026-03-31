import { useState, useEffect } from 'react'
import { supabase, DEMO_COMPANY_ID } from '../lib/supabase'
import { Fuel, AlertTriangle, TrendingDown, Activity, Droplets } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COMPANY_ID = DEMO_COMPANY_ID

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [anomalies, setAnomalies] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    // Supabase realtime: refresh on new tank_readings
    const channel = supabase.channel('dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tank_readings', filter: `company_id=eq.${COMPANY_ID}` },
        () => loadData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'anomalies', filter: `company_id=eq.${COMPANY_ID}` },
        () => loadData())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function loadData() {
    const [tanks, anomalyRes, readings] = await Promise.all([
      supabase.from('tanks').select('*').eq('company_id', COMPANY_ID).eq('is_active', true),
      supabase.from('anomalies').select('*, tanks(name)').eq('company_id', COMPANY_ID).eq('is_resolved', false).order('detected_at', { ascending: false }).limit(6),
      supabase.from('tank_readings').select('level_liters, recorded_at, tank_id')
        .eq('company_id', COMPANY_ID)
        .eq('tank_id', 'aaaa0001-0000-0000-0000-000000000001')
        .order('recorded_at', { ascending: false }).limit(20),
    ])

    const t = tanks.data || []
    const totalCapacity = t.reduce((s, x) => s + Number(x.capacity_liters), 0)
    const totalLevel    = t.reduce((s, x) => s + Number(x.current_level_liters), 0)
    const lowTanks      = t.filter(x => (Number(x.current_level_liters) / Number(x.capacity_liters)) * 100 <= Number(x.alert_threshold_percent))
    const anom = anomalyRes.data || []
    setSummary({
      totalTanks: t.length,
      totalCapacity: totalCapacity.toFixed(0),
      totalLevel: totalLevel.toFixed(0),
      overallPct: totalCapacity > 0 ? ((totalLevel / totalCapacity) * 100).toFixed(1) : 0,
      lowTanks: lowTanks.length,
      activeAnomalies: anom.length,
      criticalAnomalies: anom.filter(a => a.severity === 'critical').length,
    })
    setAnomalies(anom)

    const rd = (readings.data || []).reverse()
    setChartData(rd.map(r => ({
      time: new Date(r.recorded_at).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      liters: Number(r.level_liters),
    })))
    setLoading(false)
  }

  if (loading) return <div className="loading-spinner" />

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time fuel visibility across all depots and tanks.</p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card brand">
          <div className="kpi-icon brand"><Fuel size={18} /></div>
          <div className="kpi-value">{summary?.totalTanks}</div>
          <div className="kpi-label">Active Tanks</div>
        </div>
        <div className="kpi-card info">
          <div className="kpi-icon info"><Droplets size={18} /></div>
          <div className="kpi-value">{Number(summary?.totalLevel).toLocaleString('en-ZA')}L</div>
          <div className="kpi-label">Total Stock ({summary?.overallPct}%)</div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-icon danger"><AlertTriangle size={18} /></div>
          <div className="kpi-value">{summary?.activeAnomalies}</div>
          <div className="kpi-label">Active Anomalies</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-icon success"><Activity size={18} /></div>
          <div className="kpi-value">{summary?.lowTanks}</div>
          <div className="kpi-label">Low Level Tanks</div>
        </div>
      </div>

      {/* Chart + Anomalies */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-title"><TrendingDown size={16} className="text-brand" /> Tank A — Level Trend</div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2e47" />
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} tickFormatter={v => `${v.toLocaleString()}L`} />
                <Tooltip
                  contentStyle={{ background: '#131927', border: '1px solid #1f2e47', borderRadius: 8, fontSize: 12 }}
                  formatter={v => [`${Number(v).toLocaleString('en-ZA')} L`, 'Level']}
                />
                <Area type="monotone" dataKey="liters" stroke="#f59e0b" strokeWidth={2} fill="url(#fuelGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No chart data yet — run a simulation.</div>
          )}
        </div>

        {/* Anomaly Feed */}
        <div className="card">
          <div className="card-title"><AlertTriangle size={16} className="text-danger" /> Live Anomaly Feed</div>
          {anomalies.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>✅ No active anomalies</div>
          ) : (
            <div className="anomaly-list">
              {anomalies.map(a => (
                <div key={a.id} className="anomaly-item">
                  <div className={`anomaly-dot ${a.severity}`} />
                  <div className="anomaly-body">
                    <div className="anomaly-title">
                      <span className={`anomaly-badge ${a.severity}`}>{a.severity.toUpperCase()}</span>
                      {' '}{a.type?.replace(/_/g, ' ')}
                    </div>
                    <div className="anomaly-desc">{a.description}</div>
                    <div className="anomaly-meta">
                      <span>{a.tanks?.name}</span>
                      <span>{new Date(a.detected_at).toLocaleString('en-ZA')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
