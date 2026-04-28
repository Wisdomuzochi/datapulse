const Header = ({ apiStatus }) => {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '28px' }}>📊 DataPulse</h1>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
          ETL Pipeline — NLP Sentiment Analysis Dashboard
        </p>
      </div>
      <div style={{
        background: apiStatus === 'healthy' ? '#48bb78' : '#fc8181',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 'bold',
      }}>
        API {apiStatus === 'healthy' ? '✅ Online' : '❌ Offline'}
      </div>
    </header>
  )
}

export default Header