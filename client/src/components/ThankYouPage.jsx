import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Mail, MapPin } from 'lucide-react';
import { buildOrderWhatsAppUrl } from '../utils/whatsapp';
import { formatStorePrice } from '../utils/price';
import './ThankYouPage.css';

const ThankYouPage = ({ order, language, onBackToShop }) => {
  if (!order) {
    return (
      <div className="thank-you-page">
        <div className="thank-you-container">
          <h1>{language === 'he' ? 'הזמנה לא נמצאה' : 'Order Not Found'}</h1>
          <button onClick={onBackToShop} className="back-to-shop-btn">
            {language === 'he' ? 'חזרה לחנות' : 'Back to Shop'}
          </button>
        </div>
      </div>
    );
  }

  const whatsappUrl = buildOrderWhatsAppUrl(order, language);

  return (
    <div className="thank-you-page" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="thank-you-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="thank-you-content"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="success-icon-wrapper"
          >
            <CheckCircle2 size={80} className="success-icon" />
          </motion.div>

          {/* Title */}
          <h1 className="thank-you-title">
            {language === 'he' ? 'תודה על הזמנתך!' : 'Thank You for Your Order!'}
          </h1>

          {/* Order ID */}
          <div className="order-id">
            <span className="order-id-label">
              {language === 'he' ? 'מספר הזמנה:' : 'Order Number:'}
            </span>
            <span className="order-id-value">{order.id}</span>
          </div>

          {/* Order Details */}
          <div className="order-details">
            <div className="detail-card">
              <div className="detail-icon">
                <Mail size={24} />
              </div>
              <div className="detail-content">
                <h3>{language === 'he' ? 'אימייל אישור נשלח ל' : 'Confirmation email sent to'}</h3>
                <p>{order.customer.email}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <MapPin size={24} />
              </div>
              <div className="detail-content">
                <h3>{language === 'he' ? 'כתובת משלוח' : 'Shipping Address'}</h3>
                <p>
                  {order.shippingAddress.streetAddress}<br />
                  {order.shippingAddress.city}
                  {order.shippingAddress.stateOrProvince && `, ${order.shippingAddress.stateOrProvince}`}
                  {order.shippingAddress.zipCode && ` ${order.shippingAddress.zipCode}`}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Package size={24} />
              </div>
              <div className="detail-content">
                <h3>{language === 'he' ? 'סטטוס הזמנה' : 'Order Status'}</h3>
                <p className="order-status">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items-summary">
            <h3>{language === 'he' ? 'פריטים בהזמנה' : 'Order Items'}</h3>
            <div className="items-list">
              {order.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="order-item"
                >
                  <span className="item-name">{item.title}</span>
                  <span className="item-quantity">× {item.quantity}</span>
                  <span className="item-price">
                    {formatStorePrice(
                      Number.isFinite(Number(item.total))
                        ? Number(item.total)
                        : (Number(item.price) || 0) * (Number(item.quantity) || 1),
                      language
                    )}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="order-total">
              <span>{language === 'he' ? 'סה"כ' : 'Total'}</span>
              <span>{formatStorePrice(order.totalAmount, language)}</span>
            </div>
          </div>

          <p className="whatsapp-order-note">
            {language === 'he'
              ? 'ההזמנה נשמרה. בוואטסאפ אפשר להסדיר תשלום ומשלוח מול רזיאל.'
              : 'Your order is saved. Continue on WhatsApp to arrange payment and shipping with Raziel.'}
          </p>
          <a
            className="whatsapp-order-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {language === 'he' ? 'המשך לוואטסאפ' : 'Continue on WhatsApp'}
          </a>

          {/* Action Buttons */}
          <div className="thank-you-actions">
            <button onClick={onBackToShop} className="back-to-shop-btn">
              {language === 'he' ? 'חזרה לחנות' : 'Back to Shop'}
            </button>
            <button
              onClick={() => window.print()}
              className="print-order-btn"
            >
              {language === 'he' ? 'הדפס הזמנה' : 'Print Order'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThankYouPage;
