import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, FileText, MapPin, User } from 'lucide-react';
import './CheckoutPage.css';
import { formatStorePrice, USD_TO_ILS } from '../utils/price';
import { availableStock, stockLimitMessage } from '../utils/stock';
import { apiUrl } from '../utils/api';

// Country list with ZIP code patterns
const COUNTRIES = [
  { code: 'US', name: 'United States', zipPattern: /^\d{5}(-\d{4})?$/ },
  { code: 'IL', name: 'Israel', zipPattern: /^\d{5,7}$/ },
  { code: 'FR', name: 'France', zipPattern: /^\d{5}$/ },
  { code: 'GB', name: 'United Kingdom', zipPattern: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i },
  { code: 'CA', name: 'Canada', zipPattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i },
  { code: 'DE', name: 'Germany', zipPattern: /^\d{5}$/ },
  { code: 'AU', name: 'Australia', zipPattern: /^\d{4}$/ },
  { code: 'IT', name: 'Italy', zipPattern: /^\d{5}$/ },
  { code: 'ES', name: 'Spain', zipPattern: /^\d{5}$/ },
  { code: 'NL', name: 'Netherlands', zipPattern: /^\d{4}\s?[A-Z]{2}$/i },
];

// Validation schema for Step 1: Identity
const identitySchema = yup.object({
  fullName: yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: yup.string()
    .required('Phone number is required')
    .test('is-valid-phone', 'Invalid phone number', (value) => {
      if (!value) return false;
      return value.length >= 10;
    }),
});

// Validation schema for Step 2: Shipping
const shippingSchema = yup.object({
  shippingMethod: yup.string()
    .required('Shipping method is required')
    .oneOf(['delivery', 'pickup'], 'Invalid shipping method'),
  country: yup.string()
    .required('Country is required'),
  city: yup.string()
    .required('City is required')
    .min(2, 'City must be at least 2 characters'),
  streetAddress: yup.string()
    .required('Street address is required')
    .min(5, 'Address must be at least 5 characters'),
  stateOrProvince: yup.string()
    .required('State / Province is required'),
  zipCode: yup.string()
    .required('ZIP code is required')
    .test('matches-country-format', 'ZIP code format does not match selected country', function(value) {
      const { country } = this.parent;
      if (!country || !value) return true;
      const countryData = COUNTRIES.find(c => c.code === country);
      if (!countryData) return true;
      return countryData.zipPattern.test(value);
    }),
});

const CheckoutPage = ({ cart, language, user, stockAlerts = {}, onUpdateQuantity, onOrderComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Normalize user phone to international format for react-phone-number-input
  const normalizeUserPhone = (rawPhone) => {
    if (!rawPhone) return '';
    // Remove spaces, dashes and parentheses
    const digits = rawPhone.toString().replace(/[^\d+]/g, '');

    // Already in international format
    if (digits.startsWith('+')) {
      return digits;
    }

    // Israel mobile: 10 digits starting with 05 -> +9725...
    if (/^05\d{8}$/.test(digits)) {
      return `+972${digits.slice(1)}`;
    }

    // Generic: if starts with 0 and length >= 9, drop leading 0 and prepend +972 when Hebrew locale,
    // otherwise assume US (+1) as a safe fallback.
    if (digits.startsWith('0') && digits.length >= 9) {
      const withoutZero = digits.slice(1);
      if (language === 'he') {
        return `+972${withoutZero}`;
      }
      return `+1${withoutZero}`;
    }

    // Fallback – treat as US if nothing else matches
    if (!digits.startsWith('+')) {
      return `+1${digits}`;
    }

    return digits;
  };

  // Prepare default identity values from logged-in user (if available)
  const defaultFullName = user
    ? (user.full_name ||
       `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
       user.email ||
       '')
    : '';
  const defaultEmail = user?.email || '';
  const defaultPhone = normalizeUserPhone(user?.phone || '');

  // Form controllers for each step
  const identityForm = useForm({
    resolver: yupResolver(identitySchema),
    mode: 'onChange',
    defaultValues: {
      fullName: defaultFullName,
      email: defaultEmail,
      phone: defaultPhone,
    },
  });

  const shippingForm = useForm({
    resolver: yupResolver(shippingSchema),
    mode: 'onChange',
  });

  // If user logs in after the checkout page is already open,
  // gently prefill empty fields without overwriting what the customer already typed.
  useEffect(() => {
    if (!user) return;
    const current = identityForm.getValues();
    identityForm.reset({
      fullName: current.fullName || defaultFullName,
      email: current.email || defaultEmail,
      phone: current.phone || defaultPhone,
    });
  }, [user]);

  // Calculate total
  const totalAmount = cart.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  const currency = language === 'he' ? 'ILS' : 'USD';

  // Handle step navigation
  const handleNext = async (form, nextStep) => {
    const isValid = await form.trigger();
    if (isValid) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!agreedToTerms) {
      setOrderError(language === 'he'
        ? 'יש לאשר את התקנון ואת מדיניות הפרטיות.'
        : 'Please agree to the Terms and Privacy Policy.');
      return;
    }

    const overStockItem = cart.find((item) => {
      const limit = availableStock(item.product);
      return limit !== null && item.quantity > limit;
    });
    if (overStockItem) {
      const limit = availableStock(overStockItem.product);
      setOrderError(stockLimitMessage(limit, language));
      return;
    }

    setIsSubmitting(true);
    setOrderError('');

    const identityData = identityForm.getValues();
    const shippingData = shippingForm.getValues();

    try {
      const orderPayload = {
        customer: {
          fullName: identityData.fullName,
          email: identityData.email,
          phone: {
            countryCode: identityData.phone?.match(/^\+\d+/)?.[0] || '+1',
            number: identityData.phone
              ? identityData.phone.replace(/^\+\d+/, '')
              : '',
          },
        },
        shippingAddress: {
          shippingMethod: shippingData.shippingMethod,
          streetAddress: shippingData.streetAddress,
          city: shippingData.city,
          stateOrProvince: shippingData.stateOrProvince || null,
          zipCode: shippingData.zipCode,
          country: shippingData.country,
        },
        items: cart.map(item => ({
          productId: item.product._id || item.product.id,
          title: language === 'he' ? item.product.nameHe : item.product.nameEn,
          price: item.product.price,
          quantity: item.quantity,
        })),
        totalAmount: language === 'he' ? Math.round(totalAmount * USD_TO_ILS) : totalAmount,
        currency: currency,
        status: 'Pending',
      };

      const orderResponse = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token')
            ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
            : {}),
        },
        body: JSON.stringify(orderPayload),
      });

      const orderResult = await orderResponse.json();
      if (!orderResponse.ok || !orderResult.success || !orderResult.data?.order) {
        throw new Error(orderResult.message || 'Order failed');
      }

      setIsSubmitting(false);

      if (onOrderComplete) {
        onOrderComplete(orderResult.data.order);
      }
    } catch (error) {
      console.error('Order error:', error);
      const fallback = language === 'he'
        ? 'לא הצלחנו לשלוח את ההזמנה. נסו שוב.'
        : "We couldn't send the order. Please try again.";
      setOrderError(error.message && error.message !== 'Failed to fetch' ? error.message : fallback);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <button className="checkout-back-btn" onClick={handleBack}>
            ← {language === 'he' ? 'חזרה' : 'Back'}
          </button>
          <h1 className="checkout-title">
            {language === 'he' ? 'הזמנה' : 'Checkout'}
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="checkout-progress">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
              <div className="step-number">
                {currentStep > step ? <CheckCircle2 size={20} /> : step}
              </div>
              <div className="step-label">
                {step === 1 && (language === 'he' ? 'פרטים' : 'Identity')}
                {step === 2 && (language === 'he' ? 'משלוח' : 'Shipping')}
                {step === 3 && (language === 'he' ? 'סיכום' : 'Review')}
              </div>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <div className="checkout-content">
          <AnimatePresence mode="wait">
            {/* Step 1: Identity */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="checkout-step"
              >
                <div className="step-header">
                  <User size={24} className="step-icon" />
                  <h2>{language === 'he' ? 'פרטי לקוח' : 'Customer Information'}</h2>
                </div>

                <form className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="fullName">
                      {language === 'he' ? 'שם מלא' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      {...identityForm.register('fullName')}
                      className={identityForm.formState.errors.fullName ? 'error' : ''}
                      placeholder={language === 'he' ? 'הכנס שם מלא' : 'Enter full name'}
                    />
                    {identityForm.formState.errors.fullName && (
                      <span className="error-message">
                        {identityForm.formState.errors.fullName.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      {language === 'he' ? 'אימייל' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...identityForm.register('email')}
                      className={identityForm.formState.errors.email ? 'error' : ''}
                      placeholder={language === 'he' ? 'your@email.com' : 'your@email.com'}
                    />
                    {identityForm.formState.errors.email && (
                      <span className="error-message">
                        {identityForm.formState.errors.email.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      {language === 'he' ? 'מספר טלפון' : 'Phone Number'} *
                    </label>
                    <Controller
                      name="phone"
                      control={identityForm.control}
                      render={({ field }) => (
                        <PhoneInput
                          {...field}
                          international
                          defaultCountry={language === 'he' ? 'IL' : 'US'}
                          className={`phone-input ${identityForm.formState.errors.phone ? 'error' : ''}`}
                          placeholder={language === 'he' ? 'מספר טלפון' : 'Phone number'}
                        />
                      )}
                    />
                    {identityForm.formState.errors.phone && (
                      <span className="error-message">
                        {identityForm.formState.errors.phone.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="checkout-btn-next"
                    onClick={() => handleNext(identityForm, 2)}
                  >
                    {language === 'he' ? 'המשך למשלוח' : 'Continue to Shipping'} →
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Shipping */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="checkout-step"
              >
                <div className="step-header">
                  <MapPin size={24} className="step-icon" />
                  <h2>{language === 'he' ? 'פרטי משלוח / איסוף' : 'Delivery / Pickup Details'}</h2>
                </div>

                <form className="checkout-form">
                  <div className="form-group">
                    <label htmlFor="shippingMethod">
                      {language === 'he' ? 'שיטת משלוח' : 'Delivery Method'} *
                    </label>
                    <select
                      id="shippingMethod"
                      {...shippingForm.register('shippingMethod')}
                      className={shippingForm.formState.errors.shippingMethod ? 'error' : ''}
                    >
                      <option value="">
                        {language === 'he' ? 'בחר שיטת משלוח' : 'Select delivery method'}
                      </option>
                      <option value="delivery">
                        {language === 'he' ? 'משלוח עד הבית' : 'Home Delivery'}
                      </option>
                      <option value="pickup">
                        {language === 'he' ? 'איסוף עצמי' : 'Store Pickup'}
                      </option>
                    </select>
                    {shippingForm.formState.errors.shippingMethod && (
                      <span className="error-message">
                        {shippingForm.formState.errors.shippingMethod.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">
                      {language === 'he' ? 'ארץ' : 'Country'} *
                    </label>
                    <select
                      id="country"
                      {...shippingForm.register('country')}
                      className={shippingForm.formState.errors.country ? 'error' : ''}
                      onChange={(e) => {
                        shippingForm.setValue('country', e.target.value);
                        shippingForm.setValue('zipCode', ''); // Reset ZIP when country changes
                      }}
                    >
                      <option value="">{language === 'he' ? 'בחר מדינה' : 'Select Country'}</option>
                      {COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {shippingForm.formState.errors.country && (
                      <span className="error-message">
                        {shippingForm.formState.errors.country.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="streetAddress">
                      {language === 'he' ? 'כתובת רחוב' : 'Street Address'} *
                    </label>
                    <input
                      type="text"
                      id="streetAddress"
                      {...shippingForm.register('streetAddress')}
                      className={shippingForm.formState.errors.streetAddress ? 'error' : ''}
                      placeholder={language === 'he' ? 'רחוב ומספר בית' : 'Street and house number'}
                    />
                    {shippingForm.formState.errors.streetAddress && (
                      <span className="error-message">
                        {shippingForm.formState.errors.streetAddress.message}
                      </span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">
                        {language === 'he' ? 'עיר' : 'City'} *
                      </label>
                      <input
                        type="text"
                        id="city"
                        {...shippingForm.register('city')}
                        className={shippingForm.formState.errors.city ? 'error' : ''}
                        placeholder={language === 'he' ? 'עיר' : 'City'}
                      />
                      {shippingForm.formState.errors.city && (
                        <span className="error-message">
                          {shippingForm.formState.errors.city.message}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="stateOrProvince">
                        {language === 'he' ? 'מדינה / מחוז' : 'State / Province'} *
                      </label>
                      <input
                        type="text"
                        id="stateOrProvince"
                        {...shippingForm.register('stateOrProvince')}
                        placeholder={language === 'he' ? 'אופציונלי' : 'Optional'}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="zipCode">
                      {language === 'he' ? 'מיקוד' : 'ZIP/Postal Code'} *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      {...shippingForm.register('zipCode')}
                      className={shippingForm.formState.errors.zipCode ? 'error' : ''}
                      placeholder={language === 'he' ? 'מיקוד' : 'ZIP code'}
                    />
                    {shippingForm.formState.errors.zipCode && (
                      <span className="error-message">
                        {shippingForm.formState.errors.zipCode.message}
                      </span>
                    )}
                  </div>

                  <div className="checkout-buttons">
                    <button
                      type="button"
                      className="checkout-btn-back"
                      onClick={handleBack}
                    >
                      ← {language === 'he' ? 'חזרה' : 'Back'}
                    </button>
                    <button
                      type="button"
                      className="checkout-btn-next"
                      onClick={() => handleNext(shippingForm, 3)}
                    >
                      {language === 'he' ? 'המשך לסיכום' : 'Continue to Review'} →
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Review and send */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="checkout-step"
              >
                <div className="step-header">
                  <FileText size={24} className="step-icon" />
                  <h2>{language === 'he' ? 'שליחת הזמנה' : 'Send order request'}</h2>
                </div>

                <form
                  className="checkout-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                  }}
                >
                  {/* Order Summary */}
                  <div className="order-summary">
                    <h3>{language === 'he' ? 'סיכום הזמנה' : 'Order Summary'}</h3>
                    <div className="summary-items">
                      {cart.map((item) => {
                        const productId = item.product._id || item.product.id;
                        return (
                          <div key={productId} className="summary-item summary-item-stock">
                            <div className="summary-item-main">
                              <span>
                                {language === 'he' ? item.product.nameHe : item.product.nameEn} × {item.quantity}
                              </span>
                              <div className="summary-qty">
                                <button
                                  type="button"
                                  className="cart-quantity-btn"
                                  onClick={() => onUpdateQuantity?.(productId, item.quantity - 1)}
                                >
                                  −
                                </button>
                                <button
                                  type="button"
                                  className="cart-quantity-btn"
                                  onClick={() => onUpdateQuantity?.(productId, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                              {stockAlerts[productId] != null && (
                                <p className="cart-stock-alert" role="alert">
                                  {stockLimitMessage(stockAlerts[productId], language)}
                                </p>
                              )}
                            </div>
                            <span>
                              {formatStorePrice(item.product.price * item.quantity, language)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="summary-total">
                      <span>{language === 'he' ? 'סה"כ' : 'Total'}</span>
                      <span>
                        {formatStorePrice(totalAmount, language)}
                      </span>
                    </div>
                  </div>

                  <p className="order-request-note">
                    {language === 'he'
                      ? 'לא מתבצע תשלום באתר. אחרי שליחת ההזמנה רזיאל ייצור איתך קשר בוואטסאפ להסדרת תשלום ומשלוח.'
                      : 'No payment is taken on the site. After you send the order, Raziel will contact you on WhatsApp to arrange payment and shipping.'}
                  </p>

                  <label className="terms-consent">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(event) => setAgreedToTerms(event.target.checked)}
                    />
                    <span>
                      {language === 'he' ? (
                        <>
                          קראתי ואני מסכים/ה ל<a href="#terms" onClick={(event) => event.stopPropagation()}>תקנון</a> ול<a href="#privacy" onClick={(event) => event.stopPropagation()}>מדיניות הפרטיות</a>
                        </>
                      ) : (
                        <>
                          I have read and agree to the <a href="#terms" onClick={(event) => event.stopPropagation()}>Terms</a> and <a href="#privacy" onClick={(event) => event.stopPropagation()}>Privacy Policy</a>
                        </>
                      )}
                    </span>
                  </label>

                  {orderError && (
                    <span className="error-message">{orderError}</span>
                  )}

                  <div className="checkout-buttons">
                    <button
                      type="button"
                      className="checkout-btn-back"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      ← {language === 'he' ? 'חזרה' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      className="checkout-btn-submit"
                      disabled={isSubmitting || !agreedToTerms}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="spinner" size={20} />
                          {language === 'he' ? 'שולח...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          {language === 'he' ? 'שליחת הזמנה' : 'Send order request'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
