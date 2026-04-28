import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = {
  POSITIVE: '#48bb78',
  NEGATIVE: '#fc8181',
}

const SentimentChart = ({ records }) => {
  // Calcule la distribution des sentiments
  const distribution = records.reduce((acc, record) => {
    if (record.sentiment_label) {
      acc[record.sentiment_label] = (acc[record.sentiment_label] || 0) + 1
    }
    return acc
  }, {})

  const data = Object.entries(distribution).map(([label, count]) => ({
    name: label,
    value: count,
  }))

  if (data.length === 0) {
    return (
      <div style={cardStyle}>
        <h3>Distribution des sentiments</h3>
        <p style={{ color: '#999', textAlign: 'center' }}>
          Aucune donnée disponible
        </p>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0 }}>Distribution des sentiments</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name] || '#a0aec0'}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

const cardStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}

export default SentimentChart