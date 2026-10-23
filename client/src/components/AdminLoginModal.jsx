import { useState } from 'react';
import './AdminLoginModal.css';

const AdminLoginModal = ({ isOpen, onClose, onSuccess, language }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Save admin token to localStorage
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('admin', JSON.stringify(data.data.admin));
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
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="admin-modal-close" onClick={onClose}>✕</button>
        
        <div className="admin-modal-header">
          <div className="admin-modal-icon">⚡</div>
          <h2 className="admin-modal-title">
            {language === 'he' ? 'התחברות אדמין' : 'Admin Login'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <input
            type="email"
            name="email"
            placeholder={language === 'he' ? 'אימייל אדמין' : 'Admin Email'}
            value={formData.email}
            onChange={handleChange}
            className="admin-input"
            required
          />

          <input
            type="password"
            name="password"
            placeholder={language === 'he' ? 'סיסמה' : 'Password'}
            value={formData.password}
            onChange={handleChange}
            className="admin-input"
            required
          />

          {error && <div className="admin-error">{error}</div>}

          <button 
            type="submit" 
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading 
              ? (language === 'he' ? 'מתחבר...' : 'Loading...')
              : (language === 'he' ? 'התחבר כאדמין' : 'Login as Admin')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
