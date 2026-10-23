import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Mail, Package, Truck, Printer, MessageCircle, ExternalLink, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import './OrderDetailsModal.css';

const OrderDetailsModal = ({ order, language, onClose, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Format phone number
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    return `${phone.countryCode} ${phone.number}`;
  };

  // Get full address string
  const getFullAddress = () => {
    const addr = order.shippingAddress;
    const parts = [
      addr.streetAddress,
      addr.city,
      addr.stateOrProvince,
      addr.zipCode,
      addr.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Generate Google Maps link
  const getGoogleMapsLink = () => {
    const address = encodeURIComponent(getFullAddress());
    return `https://www.google.com/maps/search/?api=1&query=${address}`;
  };

  // Generate WhatsApp link
  const getWhatsAppLink = () => {
    if (!order.customer.phone) return '#';
    const phone = order.customer.phone.countryCode.replace('+', '') + 
                  order.customer.phone.number.replace(/\D/g, '');
    const message = encodeURIComponent(
      language === 'he' 
        ? `שלום ${order.customer.fullName}, אנו מתקשרים לגבי הזמנה ${order.id}`
        : `Hello ${order.customer.fullName}, we're contacting you regarding order ${order.id}`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  // Handle mark as shipped
  const handleMarkAsShipped = async () => {
    setIsUpdating(true);
    try {
      if (onStatusUpdate) {
        await onStatusUpdate(order.id, 'Shipped');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle print invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const symbols = {
      USD: '$',
      ILS: '₪',
      EUR: '€',
    };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  // AI Risk Analysis - Check if shipping country matches phone country code
  const aiRiskAnalysis = useMemo(() => {
    if (!order.customer.phone || !order.shippingAddress) {
      return { level: 'unknown', score: 0, message: 'Insufficient data' };
    }

    // Map country codes to country codes
    const phoneCountryMap = {
      '+1': 'US',
      '+972': 'IL',
      '+33': 'FR',
      '+44': 'GB',
      '+49': 'DE',
      '+61': 'AU',
      '+39': 'IT',
      '+34': 'ES',
      '+31': 'NL',
    };

    const phoneCode = order.customer.phone.countryCode;
    const phoneCountry = phoneCountryMap[phoneCode];
    const shippingCountry = order.shippingAddress.country;
    // +1 is shared by the US and Canada, so either shipping country matches.
    const isMatch = phoneCode === '+1'
      ? shippingCountry === 'US' || shippingCountry === 'CA'
      : phoneCountry === shippingCountry;
    
    if (isMatch) {
      return {
        level: 'low',
        score: 98,
        message: language === 'he' 
          ? 'התאמה מלאה: קוד הטלפון תואם למדינת המשלוח'
          : 'Full Match: Phone code matches shipping country',
      };
    } else {
      return {
        level: 'warning',
        score: 65,
        message: language === 'he'
          ? 'אזהרה: קוד הטלפון אינו תואם למדינת המשלוח'
          : 'Warning: Phone code does not match shipping country',
      };
    }
  }, [order, language]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="order-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="order-modal-container"
        onClick={(e) => e.stopPropagation()}
        dir={language === 'he' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="order-modal-header">
          <div className="order-header-info">
            <h2 className="order-modal-title">
              {language === 'he' ? 'פרטי הזמנה' : 'Order Details'}
            </h2>
            <div className="order-header-meta">
              <span className="order-id-display">{order.id}</span>
              <span className="order-customer-name">{order.customer.fullName}</span>
            </div>
          </div>
          <button className="order-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="order-modal-content">
          {/* Customer & Shipping Section */}
          <div className="order-section">
            <h3 className="order-section-title">
              {language === 'he' ? 'פרטי לקוח ומשלוח' : 'Customer & Shipping Information'}
            </h3>
            
            <div className="order-info-grid">
              {/* Customer Info */}
              <div className="info-card">
                <div className="info-card-header">
                  <Mail size={20} className="info-icon" />
                  <span>{language === 'he' ? 'אימייל' : 'Email'}</span>
                </div>
                <a href={`mailto:${order.customer.email}`} className="info-value link">
                  {order.customer.email}
                </a>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <Phone size={20} className="info-icon" />
                  <span>{language === 'he' ? 'טלפון' : 'Phone'}</span>
                </div>
                <a href={`tel:${order.customer.phone.countryCode}${order.customer.phone.number}`} className="info-value link">
                  {formatPhoneNumber(order.customer.phone)}
                </a>
              </div>

              {/* Shipping Address */}
              <div className="info-card full-width">
                <div className="info-card-header">
                  <MapPin size={20} className="info-icon" />
                  <span>{language === 'he' ? 'כתובת משלוח' : 'Shipping Address'}</span>
                </div>
                <div className="address-details">
                  <p className="address-line">{order.shippingAddress.streetAddress}</p>
                  <p className="address-line">
                    {order.shippingAddress.city}
                    {order.shippingAddress.stateOrProvince && `, ${order.shippingAddress.stateOrProvince}`}
                    {order.shippingAddress.zipCode && ` ${order.shippingAddress.zipCode}`}
                  </p>
                  <p className="address-line">{order.shippingAddress.country}</p>
                  <a
                    href={getGoogleMapsLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="maps-link"
                  >
                    <ExternalLink size={14} />
                    {language === 'he' ? 'פתח ב-Google Maps' : 'Open in Google Maps'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Section */}
          <div className="order-section">
            <h3 className="order-section-title">
              <Package size={20} />
              {language === 'he' ? 'פריטים בהזמנה' : 'Order Items'}
            </h3>
            
            <div className="order-items-table">
              <table>
                <thead>
                  <tr>
                    <th>{language === 'he' ? 'תמונה' : 'Image'}</th>
                    <th>{language === 'he' ? 'מוצר' : 'Product'}</th>
                    <th>{language === 'he' ? 'כמות' : 'Quantity'}</th>
                    <th>{language === 'he' ? 'מחיר יחידה' : 'Unit Price'}</th>
                    <th>{language === 'he' ? 'סה"כ' : 'Total'}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="item-image-cell">
                        <div className="item-image-placeholder">
                          <Package size={24} />
                        </div>
                      </td>
                      <td className="item-name-cell">
                        <strong>{item.title}</strong>
                        <span className="item-id">ID: {item.productId}</span>
                      </td>
                      <td className="item-quantity-cell">{item.quantity}</td>
                      <td className="item-price-cell">
                        {formatCurrency(item.price, order.currency)}
                      </td>
                      <td className="item-total-cell">
                        <strong>{formatCurrency(item.total, order.currency)}</strong>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="order-total-row">
                    <td colSpan="4" className="total-label">
                      {language === 'he' ? 'סה"כ הזמנה' : 'Order Total'}
                    </td>
                    <td className="total-value">
                      <strong>{formatCurrency(order.totalAmount, order.currency)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* AI Risk Analysis Section */}
          <div className="order-section ai-risk-section">
            <h3 className="order-section-title">
              <Shield size={20} />
              {language === 'he' ? 'סריקת אבטחה Raziel AI' : 'Raziel AI Security Scan'}
            </h3>
            
            <div className="ai-risk-analysis">
              <div className="risk-score-display">
                <div className="risk-score-circle">
                  <span className="risk-score-value">{aiRiskAnalysis.score}%</span>
                  <span className="risk-score-label">
                    {language === 'he' ? 'רמת סיכון' : 'Risk Level'}
                  </span>
                </div>
                <div className="risk-level-badge">
                  {aiRiskAnalysis.level === 'low' ? (
                    <>
                      <CheckCircle size={20} className="risk-icon safe" />
                      <span className="risk-level-text">
                        {language === 'he' ? 'נמוך (בטוח)' : 'Low (Safe)'}
                      </span>
                    </>
                  ) : aiRiskAnalysis.level === 'warning' ? (
                    <>
                      <AlertTriangle size={20} className="risk-icon warning" />
                      <span className="risk-level-text">
                        {language === 'he' ? 'אזהרה' : 'Warning'}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={20} className="risk-icon unknown" />
                      <span className="risk-level-text">
                        {language === 'he' ? 'לא ידוע' : 'Unknown'}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="risk-message">
                <p>{aiRiskAnalysis.message}</p>
                <div className="risk-details">
                  <span className="detail-item">
                    {language === 'he' ? 'קוד טלפון:' : 'Phone Code:'} {order.customer.phone?.countryCode || 'N/A'}
                  </span>
                  <span className="detail-item">
                    {language === 'he' ? 'מדינת משלוח:' : 'Shipping Country:'} {order.shippingAddress?.country || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status & Tracking */}
          <div className="order-section">
            <h3 className="order-section-title">
              <Truck size={20} />
              {language === 'he' ? 'סטטוס ומעקב' : 'Status & Tracking'}
            </h3>
            
            <div className="status-info">
              <div className="status-display">
                <span className="status-label">
                  {language === 'he' ? 'סטטוס נוכחי:' : 'Current Status:'}
                </span>
                <span className={`status-badge-large ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              
              {order.trackingNumber && (
                <div className="tracking-info">
                  <span className="tracking-label">
                    {language === 'he' ? 'מספר מעקב:' : 'Tracking Number:'}
                  </span>
                  <code className="tracking-number">{order.trackingNumber}</code>
                </div>
              )}
              
              {order.notes && (
                <div className="order-notes">
                  <span className="notes-label">
                    {language === 'he' ? 'הערות:' : 'Notes:'}
                  </span>
                  <p className="notes-text">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-modal-actions">
          {order.status !== 'Shipped' && order.status !== 'Delivered' && (
            <button
              className="action-btn action-btn-primary"
              onClick={handleMarkAsShipped}
              disabled={isUpdating}
            >
              <Truck size={18} />
              {isUpdating 
                ? (language === 'he' ? 'מעדכן...' : 'Updating...')
                : (language === 'he' ? 'סמן כנשלח' : 'Mark as Shipped')
              }
            </button>
          )}
          
          <button
            className="action-btn action-btn-secondary"
            onClick={handlePrintInvoice}
          >
            <Printer size={18} />
            {language === 'he' ? 'הדפס חשבונית' : 'Print Invoice'}
          </button>
          
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn action-btn-whatsapp"
          >
            <MessageCircle size={18} />
            {language === 'he' ? 'צור קשר ב-WhatsApp' : 'Contact via WhatsApp'}
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderDetailsModal;
