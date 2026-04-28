const StatsCard = ({ title, value, subtitle, color }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
      minWidth: '200px',
    }}>
      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{title}</p>
      <h2 style={{ margin: '8px 0', color, fontSize: '36px' }}>{value}</h2>
      <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>{subtitle}</p>
    </div>
  )
}

export default StatsCard