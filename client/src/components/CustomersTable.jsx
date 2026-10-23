import React, { useEffect, useState, useMemo } from 'react';
import { Mail, Phone, MapPin, UserCircle2 } from 'lucide-react';
import './ContactRequestsTable.css';

const CustomersTable = ({ language }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const result = await res.json();
        if (result.success) {
          setCustomers(result.data || []);
        } else {
          throw new Error(result.message || 'Failed to load customers');
        }
      } catch (err) {
        console.error('Error loading customers:', err);
        setError(
          language === 'he'
            ? 'שגיאה בטעינת רשימת הלקוחות'
            : 'Error loading customers list'
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [language]);

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      const aDate = a.joinDate ? new Date(a.joinDate).getTime() : 0;
      const bDate = b.joinDate ? new Date(b.joinDate).getTime() : 0;
      return bDate - aDate;
    });
  }, [customers]);

  if (loading) {
    return (
      <div className="contact-requests-loading">
        <div className="loading-spinner" />
        <p>{language === 'he' ? 'טוען לקוחות...' : 'Loading customers...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contact-requests-loading">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="contact-requests-table-container">
      <div className="contact-requests-header">
        <h2 className="contact-requests-title">
          <UserCircle2 size={28} />
          {language === 'he' ? 'לקוחות' : 'Customers'}
        </h2>
      </div>

      <div className="contact-requests-table-wrapper">
        <table className="contact-requests-table">
          <thead>
            <tr>
              <th>{language === 'he' ? 'שם' : 'Name'}</th>
              <th>{language === 'he' ? 'אימייל' : 'Email'}</th>
              <th>{language === 'he' ? 'טלפון' : 'Phone'}</th>
              <th>{language === 'he' ? 'מיקום' : 'Location'}</th>
              <th>{language === 'he' ? 'תאריך הצטרפות' : 'Join Date'}</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  {language === 'he'
                    ? 'אין לקוחות להצגה'
                    : 'No customers to display'}
                </td>
              </tr>
            ) : (
              sortedCustomers.map((customer, idx) => (
                <tr key={customer.email || idx}>
                  <td className="contact-name">
                    {customer.name || customer.email}
                  </td>
                  <td>
                    {customer.email ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="contact-email"
                      >
                        <Mail size={14} />
                        {customer.email}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {customer.phone ? (
                      <a
                        href={`tel:${customer.phone}`}
                        className="contact-phone"
                      >
                        <Phone size={14} />
                        {customer.phone}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span className="channel-badge">
                      <MapPin size={14} />
                      {customer.address || '-'}
                    </span>
                  </td>
                  <td>{formatDate(customer.joinDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sortedCustomers.length > 0 && (
        <div className="contact-requests-footer">
          <p>
            {language === 'he'
              ? `סה"כ ${sortedCustomers.length} לקוחות`
              : `Total: ${sortedCustomers.length} customers`}
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomersTable;

