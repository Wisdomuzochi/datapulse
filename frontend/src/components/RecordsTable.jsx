const statusColor = {
  completed: '#48bb78',
  pending:   '#ecc94b',
  processing:'#4299e1',
  failed:    '#fc8181',
}

const RecordsTable = ({ records }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ marginTop: 0 }}>Derniers enregistrements</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Source</th>
            <th style={thStyle}>Texte</th>
            <th style={thStyle}>Sentiment</th>
            <th style={thStyle}>Score</th>
            <th style={thStyle}>Statut</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={tdStyle}>#{record.id}</td>
              <td style={tdStyle}>{record.source_name}</td>
              <td style={{ ...tdStyle, maxWidth: '200px',
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' }}>
                {record.raw_text}
              </td>
              <td style={tdStyle}>{record.sentiment_label || '—'}</td>
              <td style={tdStyle}>
                {record.sentiment_score
                  ? `${(record.sentiment_score * 100).toFixed(1)}%`
                  : '—'}
              </td>
              <td style={tdStyle}>
                <span style={{
                  background: statusColor[record.status] || '#a0aec0',
                  color: 'white',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const thStyle = {
  textAlign: 'left',
  padding: '10px',
  color: '#666',
  fontSize: '13px',
}

const tdStyle = {
  padding: '12px 10px',
  fontSize: '14px',
}

export default RecordsTable