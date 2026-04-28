import { useState, useEffect } from 'react'
import { getResults, getHealth, ingestText } from './services/api'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'

// ── Design Tokens ────────────────────────────────────────────
const C = {
  bg:        '#0f1117',
  surface:   '#1a1d2e',
  surfaceAlt:'#222640',
  border:    '#2e3354',
  accent:    '#6c63ff',
  accentAlt: '#a78bfa',
  green:     '#10b981',
  red:       '#ef4444',
  yellow:    '#f59e0b',
  text:      '#e2e8f0',
  muted:     '#8892b0',
}

// ── Composant : Badge statut API ─────────────────────────────
const StatusBadge = ({ status }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    background: status === 'healthy' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
    border: `1px solid ${status === 'healthy' ? C.green : C.red}`,
    borderRadius: '20px', padding: '6px 16px',
  }}>
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: status === 'healthy' ? C.green : C.red,
      boxShadow: `0 0 8px ${status === 'healthy' ? C.green : C.red}`,
      animation: status === 'healthy' ? 'pulse 2s infinite' : 'none',
    }} />
    <span style={{ color: status === 'healthy' ? C.green : C.red, fontSize: 13, fontWeight: 600 }}>
      API {status === 'healthy' ? 'Online' : 'Offline'}
    </span>
  </div>
)

// ── Composant : Header ────────────────────────────────────────
const Header = ({ apiStatus, total }) => (
  <header style={{
    background: C.surface,
    borderBottom: `1px solid ${C.border}`,
    padding: '0 40px',
    height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 100,
    backdropFilter: 'blur(10px)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `linear-gradient(135deg, ${C.accent}, ${C.accentAlt})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>📊</div>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, color: C.text, fontWeight: 700, letterSpacing: '-0.5px' }}>
          DataPulse
        </h1>
        <p style={{ margin: 0, fontSize: 11, color: C.muted }}>
          NLP Sentiment Analysis Pipeline
        </p>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <span style={{ color: C.muted, fontSize: 13 }}>
        <span style={{ color: C.accentAlt, fontWeight: 700 }}>{total}</span> records traités
      </span>
      <StatusBadge status={apiStatus} />
    </div>
  </header>
)

// ── Composant : KPI Card ──────────────────────────────────────
const KpiCard = ({ title, value, sub, color, icon }) => (
  <div style={{
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    minWidth: 160,
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, ${color}, transparent)`,
    }} />
    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
    <p style={{ margin: '0 0 4px', color: C.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
      {title}
    </p>
    <h2 style={{ margin: '0 0 4px', color, fontSize: 36, fontWeight: 800 }}>
      {value}
    </h2>
    <p style={{ margin: 0, color: C.muted, fontSize: 12 }}>{sub}</p>
  </div>
)

// ── Composant : Tableau ───────────────────────────────────────
const RecordsTable = ({ records }) => {
  const statusColors = {
    completed: C.green, pending: C.yellow, processing: C.accent, failed: C.red
  }
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ margin: 0, color: C.text, fontSize: 16, fontWeight: 600 }}>
          Derniers enregistrements
        </h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              {['ID', 'Source', 'Texte', 'Sentiment', 'Score', 'Statut'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  color: C.muted, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: 1,
                  fontWeight: 600,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.muted }}>
                  Aucun enregistrement — testez le pipeline ci-dessus
                </td>
              </tr>
            ) : records.map((r, i) => (
              <tr key={r.id} style={{
                borderTop: `1px solid ${C.border}`,
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                transition: 'background 0.15s',
              }}>
                <td style={{ padding: '14px 16px', color: C.muted, fontSize: 13 }}>#{r.id}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    background: 'rgba(108,99,255,0.15)',
                    color: C.accentAlt, fontSize: 12,
                    padding: '3px 10px', borderRadius: 20,
                  }}>{r.source_name}</span>
                </td>
                <td style={{
                  padding: '14px 16px', color: C.text, fontSize: 13,
                  maxWidth: 220, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{r.raw_text}</td>
                <td style={{ padding: '14px 16px' }}>
                  {r.sentiment_label ? (
                    <span style={{
                      color: r.sentiment_label === 'POSITIVE' ? C.green : C.red,
                      fontWeight: 600, fontSize: 13,
                    }}>
                      {r.sentiment_label === 'POSITIVE' ? '▲' : '▼'} {r.sentiment_label}
                    </span>
                  ) : <span style={{ color: C.muted }}>—</span>}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {r.sentiment_score ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 60, height: 4, background: C.surfaceAlt,
                        borderRadius: 2, overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${r.sentiment_score * 100}%`, height: '100%',
                          background: r.sentiment_label === 'POSITIVE' ? C.green : C.red,
                          borderRadius: 2,
                        }} />
                      </div>
                      <span style={{ color: C.text, fontSize: 13 }}>
                        {(r.sentiment_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  ) : <span style={{ color: C.muted }}>—</span>}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    background: `${statusColors[r.status]}22`,
                    color: statusColors[r.status],
                    border: `1px solid ${statusColors[r.status]}44`,
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── App principale ────────────────────────────────────────────
export default function App() {
  const [records, setRecords]     = useState([])
  const [apiStatus, setApiStatus] = useState('unknown')
  const [loading, setLoading]     = useState(true)
  const [inputText, setInputText] = useState('')
  const [inputSource, setInputSource] = useState('dashboard')
  const [sending, setSending]     = useState(false)

  const fetchData = async () => {
    try {
      const health = await getHealth()
      setApiStatus(health.status)
      const data = await getResults({ limit: 50 })
      setRecords(data.records)
    } catch {
      setApiStatus('unhealthy')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleIngest = async () => {
    if (!inputText.trim() || sending) return
    setSending(true)
    try {
      await ingestText(inputSource, inputText)
      setInputText('')
      setTimeout(fetchData, 3000)
    } finally {
      setSending(false)
    }
  }

  const completed = records.filter(r => r.status === 'completed')
  const positives = completed.filter(r => r.sentiment_label === 'POSITIVE')
  const negatives = completed.filter(r => r.sentiment_label === 'NEGATIVE')
  const avgScore  = completed.length > 0
    ? (completed.reduce((s, r) => s + (r.sentiment_score || 0), 0) / completed.length * 100).toFixed(1)
    : 0

  const pieData = [
    { name: 'Positifs', value: positives.length },
    { name: 'Négatifs', value: negatives.length },
  ].filter(d => d.value > 0)

  const timelineData = completed.slice(-10).map(r => ({
    id: `#${r.id}`,
    score: +(r.sentiment_score * 100).toFixed(1),
    label: r.sentiment_label,
  }))

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `linear-gradient(135deg, ${C.accent}, ${C.accentAlt})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
      }}>📊</div>
      <p style={{ color: C.muted, fontSize: 16 }}>Chargement de DataPulse...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        textarea:focus, input:focus { outline: none; border-color: ${C.accent} !important; }
        button:hover { opacity: 0.9; transform: translateY(-1px); }
        button { transition: all 0.15s; }
      `}</style>

      <Header apiStatus={apiStatus} total={records.length} />

      <main style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ── KPIs ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <KpiCard title="Total analysés" value={completed.length}
            sub={`sur ${records.length} ingérés`} color={C.accent} icon="🔬" />
          <KpiCard title="Positifs" value={positives.length}
            sub={`${completed.length > 0 ? ((positives.length/completed.length)*100).toFixed(0) : 0}% du total`}
            color={C.green} icon="📈" />
          <KpiCard title="Négatifs" value={negatives.length}
            sub={`${completed.length > 0 ? ((negatives.length/completed.length)*100).toFixed(0) : 0}% du total`}
            color={C.red} icon="📉" />
          <KpiCard title="Score moyen" value={`${avgScore}%`}
            sub="confiance NLP moyenne" color={C.yellow} icon="🎯" />
        </div>

        {/* ── Graphiques + Formulaire ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Pie chart */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, color: C.text, fontWeight: 600 }}>
              Distribution sentiments
            </h3>
            {pieData.length === 0 ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: C.muted, fontSize: 14 }}>
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70}
                    dataKey="value" label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}>
                    <Cell fill={C.green} />
                    <Cell fill={C.red} />
                  </Pie>
                  <Tooltip contentStyle={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }} />
                  <Legend formatter={v => <span style={{ color: C.muted }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Area chart */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, color: C.text, fontWeight: 600 }}>
              Scores récents
            </h3>
            {timelineData.length === 0 ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: C.muted, fontSize: 14 }}>
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.accent} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="id" stroke={C.muted} fontSize={11} />
                  <YAxis stroke={C.muted} fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }} />
                  <Area type="monotone" dataKey="score" stroke={C.accent}
                    fill="url(#scoreGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Formulaire */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, color: C.text, fontWeight: 600 }}>
              🚀 Tester le pipeline
            </h3>
            <input
              type="text"
              placeholder="Nom de la source"
              value={inputSource}
              onChange={e => setInputSource(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', marginBottom: 12,
                background: C.surfaceAlt, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, fontSize: 14,
              }}
            />
            <textarea
              placeholder="Entrez un texte à analyser..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              rows={5}
              style={{
                width: '100%', padding: '10px 14px', marginBottom: 16,
                background: C.surfaceAlt, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, fontSize: 14,
                resize: 'vertical', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleIngest}
              disabled={sending || !inputText.trim()}
              style={{
                width: '100%', padding: '12px',
                background: sending
                  ? C.border
                  : `linear-gradient(135deg, ${C.accent}, ${C.accentAlt})`,
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 15, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer',
              }}
            >
              {sending ? '⏳ Analyse en cours...' : '⚡ Analyser le sentiment'}
            </button>
          </div>
        </div>

        {/* ── Tableau ───────────────────────────────────────── */}
        <RecordsTable records={records} />

      </main>
    </div>
  )
}