import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020202 0%, #111111 100%)',
          color: '#D4AF37',
          fontFamily: 'Cinzel, serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</h1>
            <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>שגיאה בטעינת הדף</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: 'rgba(255,255,255,0.8)' }}>
              אירעה שגיאה. אנא רענן את הדף.
            </p>
            <button
              onClick={() => {
                window.location.reload();
              }}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #F9E498 0%, #D4AF37 50%, #996515 100%)',
                border: '2px solid #D4AF37',
                color: '#020202',
                fontFamily: 'Cinzel, serif',
                fontWeight: '700',
                fontSize: '1.1rem',
                cursor: 'pointer',
                borderRadius: '6px',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
              }}
            >
              רענן דף
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
