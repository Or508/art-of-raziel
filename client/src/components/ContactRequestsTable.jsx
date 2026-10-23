import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Mail, Phone, MessageSquare } from 'lucide-react';
import './ContactRequestsTable.css';

const ContactRequestsTable = ({ language }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load contact requests from API
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setRequests(result.data || []);
          }
        }
      } catch (error) {
        console.error('Error loading contact requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
    // Refresh every 30 seconds
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update request status
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRequests(prev =>
            prev.map(req => req.id === id ? { ...req, status: newStatus } : req)
          );
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(language === 'he' ? 'שגיאה בעדכון הסטטוס' : 'Error updating status');
    }
  };

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = requests.filter(req => {
      const matchesSearch =
        req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        case 'name':
          comparison = (a.full_name || '').localeCompare(b.full_name || '');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [requests, searchTerm, statusFilter, sortBy, sortOrder]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge class and text
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        class: 'status-pending',
        text: language === 'he' ? 'המתנה' : 'Pending',
        emoji: '⏳',
      },
      in_progress: {
        class: 'status-in-progress',
        text: language === 'he' ? 'בטיפול' : 'In Progress',
        emoji: '🔄',
      },
      resolved: {
        class: 'status-resolved',
        text: language === 'he' ? 'פתור' : 'Resolved',
        emoji: '✅',
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <div className="contact-requests-loading">
        <div className="loading-spinner" />
        <p>{language === 'he' ? 'טוען בקשות...' : 'Loading requests...'}</p>
      </div>
    );
  }

  return (
    <div className="contact-requests-table-container">
      <div className="contact-requests-header">
        <h2 className="contact-requests-title">
          <MessageSquare size={28} />
          {language === 'he' ? 'בקשות יצירת קשר' : 'Contact Requests'}
        </h2>
        <div className="contact-requests-filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder={language === 'he' ? 'חפש בקשות...' : 'Search requests...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{language === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
            <option value="pending">{language === 'he' ? 'המתנה' : 'Pending'}</option>
            <option value="in_progress">{language === 'he' ? 'בטיפול' : 'In Progress'}</option>
            <option value="resolved">{language === 'he' ? 'פתור' : 'Resolved'}</option>
          </select>
        </div>
      </div>

      <div className="contact-requests-table-wrapper">
        <table className="contact-requests-table">
          <thead>
            <tr>
              <th>
                <button
                  className="sort-btn"
                  onClick={() => {
                    setSortBy('date');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <Calendar size={16} />
                  {language === 'he' ? 'תאריך' : 'Date'}
                </button>
              </th>
              <th>
                <button
                  className="sort-btn"
                  onClick={() => {
                    setSortBy('name');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  {language === 'he' ? 'שם מלא' : 'Full Name'}
                </button>
              </th>
              <th>{language === 'he' ? 'אימייל' : 'Email'}</th>
              <th>{language === 'he' ? 'טלפון' : 'Phone'}</th>
              <th>{language === 'he' ? 'סוג פגישה' : 'Meeting Type'}</th>
              <th>{language === 'he' ? 'ערוץ' : 'Channel'}</th>
              <th>{language === 'he' ? 'סטטוס' : 'Status'}</th>
              <th>{language === 'he' ? 'פעולות' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredAndSortedRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    {language === 'he' ? 'אין בקשות להצגה' : 'No requests to display'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedRequests.map((request) => {
                  const statusBadge = getStatusBadge(request.status);
                  return (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="contact-request-row"
                    >
                      <td>{formatDate(request.created_at)}</td>
                      <td className="contact-name">{request.full_name}</td>
                      <td>
                        <a href={`mailto:${request.email}`} className="contact-email">
                          <Mail size={14} />
                          {request.email}
                        </a>
                      </td>
                      <td>
                        {request.phone ? (
                          <a href={`tel:${request.phone}`} className="contact-phone">
                            <Phone size={14} />
                            {request.phone}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span className="meeting-type-badge">
                          {request.meeting_type === 'zoom' ? '💻' : '🤝'}{' '}
                          {request.meeting_type === 'zoom'
                            ? language === 'he'
                              ? 'זום'
                              : 'Zoom'
                            : language === 'he'
                            ? 'פרונטלי'
                            : 'In-Person'}
                        </span>
                      </td>
                      <td>
                        <span className="channel-badge">
                          {request.channel === 'whatsapp'
                            ? '📲 WhatsApp'
                            : request.channel === 'phone'
                            ? '📞 Phone'
                            : request.channel === 'email'
                            ? '📧 Email'
                            : request.channel || '-'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.emoji} {statusBadge.text}
                        </span>
                      </td>
                      <td>
                        <div className="contact-actions">
                          {request.status !== 'pending' && (
                            <button
                              className="action-btn action-pending"
                              onClick={() => handleStatusUpdate(request.id, 'pending')}
                              title={language === 'he' ? 'סמן כהמתנה' : 'Mark as Pending'}
                            >
                              ⏳
                            </button>
                          )}
                          {request.status !== 'in_progress' && (
                            <button
                              className="action-btn action-progress"
                              onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                              title={language === 'he' ? 'סמן כבטיפול' : 'Mark as In Progress'}
                            >
                              🔄
                            </button>
                          )}
                          {request.status !== 'resolved' && (
                            <button
                              className="action-btn action-resolved"
                              onClick={() => handleStatusUpdate(request.id, 'resolved')}
                              title={language === 'he' ? 'סמן כפתור' : 'Mark as Resolved'}
                            >
                              ✅
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {filteredAndSortedRequests.length > 0 && (
        <div className="contact-requests-footer">
          <p>
            {language === 'he'
              ? `סה"כ ${filteredAndSortedRequests.length} בקשות`
              : `Total: ${filteredAndSortedRequests.length} requests`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactRequestsTable;
