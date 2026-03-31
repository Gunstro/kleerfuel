import { Construction } from 'lucide-react'

export default function ComingSoon({ title, description }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      gap: '1rem',
      color: 'var(--text-muted)',
    }}>
      <Construction size={48} style={{ color: 'var(--amber)' }} />
      <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
      <p style={{ margin: 0, fontSize: 14, textAlign: 'center', maxWidth: 380 }}>
        {description || 'This module is part of the kleerFUEL roadmap and will be available in an upcoming phase.'}
      </p>
      <span style={{
        background: 'var(--amber)',
        color: '#000',
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 10px',
        borderRadius: 20,
        letterSpacing: 1,
      }}>COMING SOON</span>
    </div>
  )
}
