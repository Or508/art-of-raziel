import React, { useEffect, useState, useMemo } from 'react';
import { Mail, Phone, Calendar, Clock, MessageSquare, UserCircle2 } from 'lucide-react';
import './ContactRequestsTable.css';

const MeetingsTable = ({ language }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/meetings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || `HTTP ${res.status}`);
        }

        setMeetings(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error('Error loading meetings:', err);
        setError(language === 'he' ? 'שגיאה בטעינת פגישות' : 'Error loading meetings');
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [language]);

  const meetingTypeLabel = (type) => {
    if (language === 'he') {
      if (type === 'zoom') return 'זום';
      if (type === 'inPerson') return 'פרונטלי';
      return type || '-';
    }
    if (type === 'zoom') return 'Zoom';
    if (type === 'inPerson') return 'In-Person';
    return type || '-';
  };

  const channelLabel = (channel) => {
    if (language === 'he') {
      if (channel === 'whatsapp') return 'וואטסאפ';
      if (channel === 'phone') return 'טלפון';
      if (channel === 'email') return 'אימייל';
      return channel || '-';
    }
    if (channel === 'whatsapp') return 'WhatsApp';
    if (channel === 'phone') return 'Phone';
    if (channel === 'email') return 'Email';
    return channel || '-';
  };

  const statusBadge = (status) => {
    const s = status || 'pending';
    if (s === 'pending') return { className: 'status-badge status-pending', text: language === 'he' ? 'המתנה' : 'Pending' };
    if (s === 'in_progress') return { className: 'status-badge status-in-progress', text: language === 'he' ? 'בטיפול' : 'In Progress' };
    if (s === 'resolved') return { className: 'status-badge status-resolved', text: language === 'he' ? 'פתור' : 'Resolved' };
    return { className: 'status-badge status-pending', text: s };
  };

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

  const sortedMeetings = useMemo(() => {
    return [...meetings];
  }, [meetings]);

  if (loading) {
    return (
      <div className="contact-requests-loading">
        <div className="loading-spinner" />
        <p>{language === 'he' ? 'טוען פגישות...' : 'Loading meetings...'}</p>
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
    <div className="contact-requests-table-container" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="contact-requests-header">
        <h2 className="contact-requests-title">
          <UserCircle2 size={28} />
          {language === 'he' ? 'פגישות' : 'Meetings'}
        </h2>
      </div>

      <div className="contact-requests-table-wrapper">
        <table className="contact-requests-table">
          <thead>
            <tr>
              <th>{language === 'he' ? 'שם' : 'Name'}</th>
              <th>{language === 'he' ? 'טלפון' : 'Phone'}</th>
              <th>{language === 'he' ? 'אימייל' : 'Email'}</th>
              <th>{language === 'he' ? 'סוג פגישה' : 'Type'}</th>
              <th>{language === 'he' ? 'תאריך' : 'Date'}</th>
              <th>{language === 'he' ? 'שעה' : 'Time'}</th>
              <th>{language === 'he' ? 'ערוץ' : 'Channel'}</th>
              <th>{language === 'he' ? 'סטטוס/הערות' : 'Status/Notes'}</th>
            </tr>
          </thead>
          <tbody>
            {sortedMeetings.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  {language === 'he' ? 'אין פגישות להצגה' : 'No meetings to display'}
                </td>
              </tr>
            ) : (
              sortedMeetings.map((m, idx) => {
                const sb = statusBadge(m.status);
                return (
                  <tr key={m.id || idx}>
                    <td className="contact-name">{m.full_name || m.name || '-'}</td>
                    <td>
                      {m.phone ? (
                        <a href={`tel:${m.phone}`} className="contact-phone">
                          <Phone size={14} />
                          {m.phone}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {m.email ? (
                        <a href={`mailto:${m.email}`} className="contact-email">
                          <Mail size={14} />
                          {m.email}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <span className="meeting-type-badge">
                        <MessageSquare size={14} />
                        {meetingTypeLabel(m.meeting_type)}
                      </span>
                    </td>
                    <td>
                      <span className="channel-badge">
                        <Calendar size={14} />
                        {formatDate(m.meeting_date)}
                      </span>
                    </td>
                    <td>
                      <span className="channel-badge">
                        <Clock size={14} />
                        {m.meeting_time || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="channel-badge">
                        {channelLabel(m.channel)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span className={sb.className}>{sb.text}</span>
                        <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {m.notes ? m.notes : language === 'he' ? '—' : '-'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeetingsTable;

