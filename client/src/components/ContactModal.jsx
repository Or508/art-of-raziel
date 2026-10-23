import React, { useMemo } from 'react';
import './ContactModal.css';

const ContactModal = ({ isOpen, onClose, user, language }) => {
  const [form, setForm] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    meetingType: 'zoom', // 'zoom' | 'inPerson'
    notes: '',
    meeting_date: '',
    meeting_time: '',
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [bookedSlots, setBookedSlots] = React.useState([]);
  const [bookedSlotsDate, setBookedSlotsDate] = React.useState('');
  const [slotsLoading, setSlotsLoading] = React.useState(false);

  // Prefill from logged-in user
  React.useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      fullName:
        prev.fullName ||
        user.full_name ||
        `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
        '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  const isInPerson = form.meetingType === 'inPerson';

  const BUSINESS_TIMEZONE = 'America/New_York';
  const userTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const pad2 = (n) => String(n).padStart(2, '0');

  // Get YYYY-MM-DD for a given timezone (based on a Date instant).
  const getYMDInTimezone = (date, timeZone) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;

    return {
      year: Number(year),
      month: Number(month),
      day: Number(day),
    };
  };

  const ymdToISO = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

  const businessToday = getYMDInTimezone(new Date(), BUSINESS_TIMEZONE);
  const todayISO = ymdToISO(businessToday.year, businessToday.month, businessToday.day);

  // Work in UTC dates to avoid local timezone affecting the selected business date.
  const businessTodayUTCDate = new Date(Date.UTC(businessToday.year, businessToday.month - 1, businessToday.day));

  const startOfWeekSundayUTC = (d) => {
    const dd = new Date(d.getTime());
    const day = dd.getUTCDay(); // 0=Sunday ... 6=Saturday
    dd.setUTCDate(dd.getUTCDate() - day);
    dd.setUTCHours(0, 0, 0, 0);
    return dd;
  };

  const addDaysUTC = (d, days) => {
    const dd = new Date(d.getTime());
    dd.setUTCDate(dd.getUTCDate() + days);
    dd.setUTCHours(0, 0, 0, 0);
    return dd;
  };

  const [weekStart, setWeekStart] = React.useState(() =>
    startOfWeekSundayUTC(businessTodayUTCDate)
  );

  // Strict 90-minute intervals between 12:00 and 20:00 inclusive.
  const timeSlots = ['12:00', '13:30', '15:00', '16:30', '18:00', '19:30'];

  // Convert a NY local time slot to user's local time on the selected meeting_date.
  const getUserTimeForSlot = (meetingDateISO, nyTimeHHMM) => {
    if (!meetingDateISO || !nyTimeHHMM) return nyTimeHHMM;

    const [yStr, mStr, dStr] = meetingDateISO.split('-');
    const [hStr, minStr] = nyTimeHHMM.split(':');
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
    const h = Number(hStr);
    const min = Number(minStr);

    // Desired wall time in BUSINESS_TIMEZONE: (y,m,d,h,min)
    const targetLocalAsUTC = Date.UTC(y, m - 1, d, h, min, 0);

    // Iteratively compute the UTC timestamp for the target wall time in BUSINESS_TIMEZONE.
    let guessUtc = targetLocalAsUTC;
    for (let i = 0; i < 3; i += 1) {
      const guessDate = new Date(guessUtc);
      const localParts = new Intl.DateTimeFormat('en-US', {
        timeZone: BUSINESS_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(guessDate);

      const yy = Number(localParts.find((p) => p.type === 'year')?.value);
      const mm = Number(localParts.find((p) => p.type === 'month')?.value);
      const dd = Number(localParts.find((p) => p.type === 'day')?.value);
      const hh = Number(localParts.find((p) => p.type === 'hour')?.value);
      const mi = Number(localParts.find((p) => p.type === 'minute')?.value);

      const localAsUTC = Date.UTC(yy, mm - 1, dd, hh, mi, 0);
      const offsetMs = localAsUTC - guessUtc;
      const desiredUtc = targetLocalAsUTC - offsetMs;

      if (Math.abs(desiredUtc - guessUtc) < 1000) {
        guessUtc = desiredUtc;
        break;
      }
      guessUtc = desiredUtc;
    }

    const finalDate = new Date(guessUtc);
    const userParts = new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(finalDate);

    const userH = userParts.find((p) => p.type === 'hour')?.value;
    const userMin = userParts.find((p) => p.type === 'minute')?.value;
    return `${userH}:${userMin}`;
  };

  const getISODateFromUTC = (d) =>
    `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch booked slots when a meeting date is selected
  React.useEffect(() => {
    const date = form.meeting_date;
    if (!date) {
      setBookedSlots([]);
      setBookedSlotsDate('');
      return;
    }

    let isActive = true;
    const loadBookedSlots = async () => {
      setSlotsLoading(true);
      setBookedSlots([]);
      setBookedSlotsDate('');
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/contact/booked-slots?date=${encodeURIComponent(
            date
          )}`
        );
        const json = await res.json();
        if (!isActive) return;

        if (res.ok && json.success) {
          setBookedSlots(Array.isArray(json.data) ? json.data : []);
          setBookedSlotsDate(date);
          // If previously selected time became booked, clear it.
          setForm((prev) => {
            if (prev.meeting_time && json.data?.includes(prev.meeting_time)) {
              return { ...prev, meeting_time: '' };
            }
            return prev;
          });
        } else {
          setBookedSlots([]);
          setBookedSlotsDate(date);
        }
      } catch (err) {
        console.warn('Error loading booked slots:', err);
        if (isActive) {
          setBookedSlots([]);
          setBookedSlotsDate(date);
        }
      } finally {
        if (isActive) setSlotsLoading(false);
      }
    };

    loadBookedSlots();
    return () => {
      isActive = false;
    };
  }, [form.meeting_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (slotsLoading) {
      setSubmitting(false);
      alert(
        language === 'he'
          ? 'טוען זמינות... נסו שוב רגע.'
          : 'Loading availability... please try again in a moment.'
      );
      return;
    }

    if (!form.meeting_date || !form.meeting_time) {
      setSubmitting(false);
      alert(
        language === 'he'
          ? 'נא לבחור תאריך ושעה פנויה.'
          : 'Please select a meeting date and an available time.'
      );
      return;
    }

    if (form.meeting_date < todayISO) {
      setSubmitting(false);
      alert(
        language === 'he'
          ? 'יש לבחור תאריך מהיום והלאה.'
          : 'Please select a date from today onward.'
      );
      return;
    }

    if (bookedSlotsDate === form.meeting_date && bookedSlots.includes(form.meeting_time)) {
      setSubmitting(false);
      alert(
        language === 'he'
          ? 'השעה שבחרת כבר תפוסה. נסה שעה אחרת.'
          : 'That time is already booked. Please choose another slot.'
      );
      return;
    }

    try {
      // 1. Send request to backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          meetingType: form.meetingType,
          notes: form.notes,
          meeting_date: form.meeting_date,
          meeting_time: form.meeting_time,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit request');
      }

      setSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Error submitting contact request:', error);
      alert(
        language === 'he'
          ? 'שגיאה בשליחת הבקשה. נסה שוב מאוחר יותר.'
          : 'Error submitting request. Please try again later.'
      );
      setSubmitting(false);
    }
  };

  const meetingInfo = useMemo(() => {
    if (isInPerson) {
      return language === 'he'
        ? '🤝 פגישה פרונטלית פנים אל פנים בעלות של 200$ – מפגש מעמיק, ייעוץ והכוונה מלאה עם קורא בקבלה.'
        : '🤝 In-person face-to-face meeting for $200 – deep session with a Kabbalah reader providing full guidance.';
    }
    return language === 'he'
      ? '💻 פגישת זום היא שיחת היכרות של 15 דקות בלבד כדי להכיר את קורא בקבלה ולקבל הסבר על הצרכים שלכם.'
      : '💻 Zoom meeting is a 15-minute intro call to meet the Kabbalah reader and understand your needs.';
  }, [isInPerson, language]);

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="contact-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="contact-modal-header">
          <div className="contact-modal-icon">📅</div>
          <h2 className="contact-modal-title">
            {language === 'he' ? 'קביעת פגישה / יצירת קשר' : 'Book a Meeting / Contact'}
          </h2>
          <p className="contact-modal-subtitle">
            {language === 'he'
              ? 'בחרו סוג פגישה ואופן יצירת הקשר הנוח לכם.'
              : 'Choose your meeting type and preferred contact channel.'}
          </p>
        </div>

        <form className="contact-modal-form" onSubmit={handleSubmit}>
          <div className="contact-form-grid">
            <div className="contact-form-column">
              <label className="contact-label">
                {language === 'he' ? 'שם מלא' : 'Full Name'} *
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />

              <label className="contact-label">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label className="contact-label">
                {language === 'he' ? 'טלפון' : 'Phone'}
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="contact-form-column">
              <label className="contact-label">
                {language === 'he' ? 'סוג פגישה' : 'Meeting Type'} *
              </label>
              <div className="contact-radio-group">
                <label
                  className={`contact-radio-card ${
                    form.meetingType === 'zoom' ? 'active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="meetingType"
                    value="zoom"
                    checked={form.meetingType === 'zoom'}
                    onChange={handleChange}
                  />
                  <span className="contact-radio-emoji">💻</span>
                  <span className="contact-radio-title">
                    {language === 'he' ? 'זום (15 דקות)' : 'Zoom (15 min)'}
                  </span>
                  <span className="contact-radio-desc">
                    {language === 'he'
                      ? 'שיחת היכרות קצרה ללא התחייבות.'
                      : 'Short intro call, no commitment.'}
                  </span>
                </label>

                <label
                  className={`contact-radio-card ${
                    form.meetingType === 'inPerson' ? 'active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="meetingType"
                    value="inPerson"
                    checked={form.meetingType === 'inPerson'}
                    onChange={handleChange}
                  />
                  <span className="contact-radio-emoji">🤝</span>
                  <span className="contact-radio-title">
                    {language === 'he' ? 'פגישה פרונטלית ($200)' : 'In-Person ($200)'}
                  </span>
                  <span className="contact-radio-desc">
                    {language === 'he'
                      ? 'מפגש עומק אישי עם קורא בקבלה.'
                      : 'Personal deep-dive session with a Kabbalah reader.'}
                  </span>
                </label>
              </div>

              <div
                className={`meeting-info-box ${isInPerson ? 'in-person' : 'zoom'}`}
              >
                {meetingInfo}
              </div>

              {/* Weekly calendar (Calendly-style) + 90-minute time slots */}
              {(form.meetingType === 'zoom' || form.meetingType === 'inPerson') && (
                <div className="contact-booking-section">
                  <div className="booking-week-nav">
                    <button
                      type="button"
                      className="booking-week-arrow"
                      onClick={() => setWeekStart(addDaysUTC(weekStart, -7))}
                      aria-label={language === 'he' ? 'שבוע קודם' : 'Previous week'}
                    >
                      ←
                    </button>

                    <div className="booking-week-range">
                      {(() => {
                        const start = weekStart;
                        const end = addDaysUTC(weekStart, 4); // Sunday..Thursday
                        const startISO = getISODateFromUTC(start);
                        const endISO = getISODateFromUTC(end);
                        const startD = new Date(`${startISO}T00:00:00Z`).toLocaleDateString(
                          language === 'he' ? 'he-IL' : 'en-US',
                          { month: 'short', day: 'numeric', timeZone: BUSINESS_TIMEZONE }
                        );
                        const endD = new Date(`${endISO}T00:00:00Z`).toLocaleDateString(
                          language === 'he' ? 'he-IL' : 'en-US',
                          { month: 'short', day: 'numeric', timeZone: BUSINESS_TIMEZONE }
                        );
                        return `${startD} - ${endD}`;
                      })()}
                    </div>

                    <button
                      type="button"
                      className="booking-week-arrow"
                      onClick={() => setWeekStart(addDaysUTC(weekStart, 7))}
                      aria-label={language === 'he' ? 'שבוע הבא' : 'Next week'}
                    >
                      →
                    </button>
                  </div>

                  <div className="booking-days-row" role="group" aria-label="Available days">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const d = addDaysUTC(weekStart, i); // Sunday..Thursday only
                      const iso = getISODateFromUTC(d);
                      const dayIndex = d.getUTCDay();
                      const isSelected = form.meeting_date === iso;
                      const isPast = iso < todayISO;

                      const dayNameHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳'];
                      const dayNameEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
                      const dayLabel =
                        language === 'he' ? dayNameHe[dayIndex] : dayNameEn[dayIndex];

                      return (
                        <button
                          key={iso}
                          type="button"
                          className={`booking-day-card ${isSelected ? 'selected' : ''} ${
                            isPast ? 'disabled' : ''
                          }`}
                          disabled={isPast}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              meeting_date: iso,
                              meeting_time: '',
                            }));
                          }}
                        >
                          <div className="booking-day-name">{dayLabel}</div>
                          <div className="booking-day-date">{d.getUTCDate()}</div>
                        </button>
                      );
                    })}
                  </div>

                  {form.meeting_date && (
                    <div className="contact-time-slots-section">
                      <label className="contact-label">
                        {language === 'he'
                          ? 'בחרו שעת פגישה פנויה *'
                          : 'Select an available time slot *'}
                      </label>
                      <p className="booking-times-helper">
                        {language === 'he'
                          ? 'מציג שעות לפי שעון ניו-יורק ובזמן המקומי שלך.'
                          : 'Showing times in New York time and your local timezone.'}
                      </p>

                      <div className="time-slots-grid" role="group" aria-label="Time slots">
                        {timeSlots.map((time) => {
                          const isBooked = bookedSlots.includes(time);
                          const isSelected = form.meeting_time === time;
                          const userTime = getUserTimeForSlot(form.meeting_date, time);
                          return (
                            <button
                              key={time}
                              type="button"
                              className={`time-slot-btn ${isSelected ? 'active' : ''}`}
                              disabled={slotsLoading || isBooked}
                              onClick={() => {
                                if (!slotsLoading && !isBooked) {
                                  setForm((prev) => ({
                                    ...prev,
                                    meeting_time: time,
                                  }));
                                }
                              }}
                            >
                              <div className="time-slot-btn-content">
                                <div className="time-slot-btn-main">
                                  {time} NY Time
                                </div>
                                <div className="time-slot-btn-sub">
                                  {userTime} Your Time
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {slotsLoading ? (
                        <p className="time-slots-loading">
                          {language === 'he' ? 'טוען זמינות...' : 'Loading availability...'}
                        </p>
                      ) : (
                        <p className="time-slots-hint">
                          {language === 'he'
                            ? 'בחרו שעה פנויה כדי להמשיך.'
                            : 'Select an available time slot to continue.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          <label className="contact-label">
            {language === 'he' ? 'פרטים נוספים / נושא הפגישה' : 'Details / Topic'}
          </label>
          <textarea
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            placeholder={
              language === 'he'
                ? 'ספרו בקצרה על מה תרצו לדבר בפגישה...'
                : 'Briefly describe what you would like to discuss...'
            }
          />

          <div className="contact-modal-footer">
            <button
              type="button"
              className="contact-secondary-btn"
              onClick={onClose}
              disabled={submitting}
            >
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </button>
            <a
              href="https://wa.me/13478679396"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-direct-whatsapp-link"
            >
              <button
                type="button"
                className="contact-direct-whatsapp-btn"
                disabled={submitting}
              >
                דברו איתנו ב-WhatsApp
              </button>
            </a>
            <button
              type="submit"
              className="contact-primary-btn"
              disabled={submitting}
            >
              {submitting
                ? language === 'he'
                  ? 'שולח...'
                  : 'Sending...'
                : language === 'he'
                ? 'שלח בקשה'
                : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;

