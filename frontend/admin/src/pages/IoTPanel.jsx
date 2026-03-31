import { useState, useEffect, useRef } from 'react'
import { supabase, DEMO_COMPANY_ID, API_URL } from '../lib/supabase'
import { Cpu, Play, Zap } from 'lucide-react'

const COMPANY_ID = DEMO_COMPANY_ID

export default function IoTPanel() {
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState([])
  const [readings, setReadings] = useState([])
  const [tanks, setTanks] = useState([])
  const logRef = useRef(null)

  useEffect(() => {
    supabase.from('tanks').select('id, name, iot_device_id').eq('company_id', COMPANY_ID).eq('is_active', true)
      .then(({ data }) => setTanks(data || []))

    // Subscribe to new readings in realtime
    const channel = supabase.channel('iot-panel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tank_readings', filter: `company_id=eq.${COMPANY_ID}` },
        (payload) => {
          const r = payload.new
          addLog(`IoT ▶ Tank ${r.tank_id.slice(-4)} | ${Number(r.level_liters).toFixed(0)}L (${Number(r.level_percent).toFixed(1)}%) | src: ${r.source}`, 'ok')
          setReadings(prev => [r, ...prev].slice(0, 50))
        })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'anomalies', filter: `company_id=eq.${COMPANY_ID}` },
        (payload) => {
          const a = payload.new
          addLog(`🚨 ANOMALY [${a.severity?.toUpperCase()}] ${a.type} — ${a.description}`, 'error')
        })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  function addLog(msg, type = 'ok') {
    const ts = new Date().toLocaleTimeString('en-ZA')
    setLogs(prev => [{ ts, msg, type }, ...prev].slice(0, 200))
  }

  async function runSimulation() {
    setRunning(true)
    addLog(`Triggering simulation for company ${COMPANY_ID}…`, 'warn')
    try {
      const res = await fetch(`${API_URL}/api/iot/simulate/${COMPANY_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: COMPANY_ID, anomaly_chance: 0.1 }),
      })
      const data = await res.json()
      addLog(`Simulation dispatched: ${data.status}`, 'ok')
    } catch (err) {
      addLog(`API error: ${err.message} (Is the backend running?)`, 'error')
    } finally {
      setTimeout(() => setRunning(false), 2000)
    }
  }

  async function ingestManual(device_id, level) {
    addLog(`Manual ingest: ${device_id} → ${level}L`, 'warn')
    try {
      const res = await fetch(`${API_URL}/api/iot/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id, level_liters: Number(level), source: 'iot' }),
      })
      const data = await res.json()
      addLog(`Ingested OK: tank ${data.tank_id?.slice(-6)}, ${data.level_percent}%`, 'ok')
    } catch (err) {
      addLog(`Ingest error: ${err.message}`, 'error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>IoT Simulator</h1>
        <p>Simulate IoT sensor readings, test anomaly detection, and watch live updates flow in.</p>
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Controls */}
        <div className="card">
          <div className="card-title"><Cpu size={16} /> Simulation Controls</div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
              Runs one round of simulated IoT readings for all tanks. Includes realistic consumption rates,
              quiet-hours theft simulation (10% chance), and automatic anomaly detection.
            </p>
            <button className="btn btn-primary" onClick={runSimulation} disabled={running}>
              {running ? <><span className="iot-pulse" /> Running…</> : <><Play size={14} /> Run Simulation</>}
            </button>
          </div>

          <div className="section-divider" />

          <div className="card-title" style={{ marginBottom: 12 }}><Zap size={16} /> Manual Ingest</div>
          <p style={{ fontSize: 12, color:'var(--text-muted)', marginBottom: 12 }}>
            Send a custom reading for a specific device:
          </p>

          {tanks.map(t => t.iot_device_id && (
            <ManualIngestRow key={t.id} tank={t} onIngest={ingestManual} />
          ))}
        </div>

        {/* Live readings table */}
        <div className="card">
          <div className="card-title">
            <span className="iot-pulse" style={{ marginRight: 8 }} />
            Live Readings Feed
          </div>
          {readings.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>Run a simulation to see readings appear here in real-time.</div>
          ) : (
            <table className="data-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Tank</th>
                  <th>Liters</th>
                  <th>%</th>
                  <th>Source</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {readings.slice(0, 15).map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>…{r.tank_id?.slice(-6)}</td>
                    <td className="text-brand">{Number(r.level_liters).toFixed(0)}L</td>
                    <td>{Number(r.level_percent).toFixed(1)}%</td>
                    <td><span style={{ color: 'var(--text-muted)' }}>{r.source}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(r.recorded_at).toLocaleTimeString('en-ZA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="card">
        <div className="card-title">
          <span className="iot-pulse" style={{ marginRight: 8 }} />
          Activity Log
          <button className="btn btn-ghost" style={{ marginLeft:'auto', padding:'4px 10px', fontSize:11 }} onClick={() => setLogs([])}>
            Clear
          </button>
        </div>
        <div className="sim-log" ref={logRef}>
          {logs.length === 0 && <span style={{ color:'var(--text-muted)' }}>Waiting for activity…</span>}
          {logs.map((l, i) => (
            <div key={i} className={`sim-log-line ${l.type}`}>
              <span style={{ color:'var(--text-muted)', marginRight: 8 }}>[{l.ts}]</span>
              {l.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ManualIngestRow({ tank, onIngest }) {
  const [level, setLevel] = useState('')
  return (
    <div style={{ display:'flex', gap: 8, marginBottom: 8, alignItems:'center' }}>
      <span style={{ fontSize: 12, color:'var(--text-secondary)', flex: 1, minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {tank.iot_device_id}
      </span>
      <input
        className="form-input"
        type="number"
        placeholder="Liters"
        value={level}
        onChange={e => setLevel(e.target.value)}
        style={{ width: 90, padding:'6px 10px' }}
      />
      <button className="btn btn-success" style={{ padding:'6px 12px', fontSize:12 }}
        onClick={() => { if(level) { onIngest(tank.iot_device_id, level); setLevel('') } }}>
        Send
      </button>
    </div>
  )
}
