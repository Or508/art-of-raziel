import { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onSuccess, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Save token to localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        onSuccess(data.data);
        onClose();
      } else {
        setError(data.message || (language === 'he' ? 'שגיאה בהתחברות' : 'Login error'));
      }
    } catch {
      setError(language === 'he' ? 'שגיאת שרת' : 'Server error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>✕</button>
        
        <div className="auth-modal-header">
          <div className="auth-modal-icon">🔐</div>
          <h2 className="auth-modal-title">
            {isLogin 
              ? (language === 'he' ? 'התחברות' : 'Login')
              : (language === 'he' ? 'הרשמה' : 'Register')
            }
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-modal-form">
          {!isLogin && (
            <>
              <div className="auth-form-row">
                <input
                  type="text"
                  name="first_name"
                  placeholder={language === 'he' ? 'שם פרטי' : 'First Name'}
                  value={formData.first_name}
                  onChange={handleChange}
                  className="auth-input"
                  required={!isLogin}
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder={language === 'he' ? 'שם משפחה' : 'Last Name'}
                  value={formData.last_name}
                  onChange={handleChange}
                  className="auth-input"
                  required={!isLogin}
                />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder={language === 'he' ? 'טלפון' : 'Phone'}
                value={formData.phone}
                onChange={handleChange}
                className="auth-input"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder={language === 'he' ? 'אימייל' : 'Email'}
            value={formData.email}
            onChange={handleChange}
            className="auth-input"
            required
          />

          <input
            type="password"
            name="password"
            placeholder={language === 'he' ? 'סיסמה' : 'Password'}
            value={formData.password}
            onChange={handleChange}
            className="auth-input"
            required
            minLength={6}
          />

          {error && <div className="auth-error">{error}</div>}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading 
              ? (language === 'he' ? 'מתחבר...' : 'Loading...')
              : (isLogin 
                  ? (language === 'he' ? 'התחבר' : 'Login')
                  : (language === 'he' ? 'הרשם' : 'Register')
                )
            }
          </button>
        </form>

        <div className="auth-modal-footer">
          <button 
            className="auth-toggle-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                phone: ''
              });
            }}
          >
            {isLogin
              ? (language === 'he' ? 'אין לך חשבון? הירשם' : "Don't have an account? Register")
              : (language === 'he' ? 'יש לך חשבון? התחבר' : 'Have an account? Login')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
