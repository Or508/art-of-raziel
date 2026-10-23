import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, CreditCard, MapPin, User } from 'lucide-react';
import './CheckoutPage.css';
import { formatStorePrice, USD_TO_ILS } from '../utils/price';
import { availableStock, stockLimitMessage } from '../utils/stock';

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

// Validation schema for Step 3: Payment
const paymentSchema = yup.object({
  cardNumber: yup.string()
    .required('Card number is required')
    .matches(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, 'Card number must be 16 digits'),
  expiryDate: yup.string()
    .required('Expiry date is required')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY'),
  cvv: yup.string()
    .required('CVV is required')
    .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  cardholderName: yup.string()
    .required('Cardholder name is required')
    .min(2, 'Name must be at least 2 characters'),
});

const CheckoutPage = ({ cart, language, user, stockAlerts = {}, onUpdateQuantity, onOrderComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');

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

  const paymentForm = useForm({
    resolver: yupResolver(paymentSchema),
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
    const overStockItem = cart.find((item) => {
      const limit = availableStock(item.product);
      return limit !== null && item.quantity > limit;
    });
    if (overStockItem) {
      const limit = availableStock(overStockItem.product);
      setPaymentError(stockLimitMessage(limit, language));
      return;
    }

    setIsSubmitting(true);
    setPaymentError('');

    // Get all form data
    const identityData = identityForm.getValues();
    const shippingData = shippingForm.getValues();

    // Convert total to base currency for the gateway (assume USD for now)
    const totalInUsd = currency === 'ILS' ? Math.round(totalAmount) : totalAmount;

    // 1) Create a mock token from card data (later: real token from Stripe/PayPal SDK)
    const paymentToken = `tok_${Date.now()}`;

    try {
      // 2) Call backend payments API
      const paymentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: paymentToken,
          amount: Math.round(totalInUsd * 100), // smallest unit (cents/agorot)
          currency: 'USD',
          orderId: `ORD-${Date.now()}`,
          customer: {
            fullName: identityData.fullName,
            email: identityData.email,
          },
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentResult.success) {
        throw new Error(paymentResult.message || 'Payment failed');
      }

      const transactionId = paymentResult.data?.transactionId || `PAY-${Date.now()}`;

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
        paymentId: transactionId,
      };

      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
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
      console.error('Payment error:', error);
      const fallback = language === 'he'
        ? 'התשלום נכשל, נסה שוב או פנה לתמיכה.'
        : 'Payment failed, please try again or contact support.';
      setPaymentError(error.message && error.message !== 'Failed to fetch' ? error.message : fallback);
      setIsSubmitting(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
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
            {language === 'he' ? 'תשלום' : 'Checkout'}
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
                {step === 3 && (language === 'he' ? 'תשלום' : 'Payment')}
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
                      {language === 'he' ? 'המשך לתשלום' : 'Continue to Payment'} →
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="checkout-step"
              >
                <div className="step-header">
                  <CreditCard size={24} className="step-icon" />
                  <h2>{language === 'he' ? 'פרטי תשלום' : 'Payment Information'}</h2>
                </div>

                <div className="payment-security">
                  <div className="payment-shield" />
                  <div className="payment-security-text">
                    <span className="payment-security-title">
                      {language === 'he' ? 'הגנת כרטיס משופרת' : 'Enhanced Card Protection'}
                    </span>
                    <span className="payment-security-subtitle">
                      {language === 'he'
                        ? 'הנתונים מוצפנים ואינם נשמרים בשרת – חיוב מתבצע דרך שרת מאובטח.'
                        : 'Card data is encrypted and never stored – all charges are processed via a secure gateway.'}
                    </span>
                  </div>
                </div>

                <form className="checkout-form" onSubmit={paymentForm.handleSubmit(handleSubmit)}>
                  <div className="form-group">
                    <label htmlFor="cardholderName">
                      {language === 'he' ? 'שם על הכרטיס' : 'Cardholder Name'} *
                    </label>
                    <input
                      type="text"
                      id="cardholderName"
                      {...paymentForm.register('cardholderName')}
                      className={paymentForm.formState.errors.cardholderName ? 'error' : ''}
                      placeholder={language === 'he' ? 'שם מלא כפי שמופיע על הכרטיס' : 'Name as it appears on card'}
                    />
                    {paymentForm.formState.errors.cardholderName && (
                      <span className="error-message">
                        {paymentForm.formState.errors.cardholderName.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardNumber">
                      {language === 'he' ? 'מספר כרטיס' : 'Card Number'} *
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      {...paymentForm.register('cardNumber')}
                      className={paymentForm.formState.errors.cardNumber ? 'error' : ''}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        paymentForm.setValue('cardNumber', formatted);
                      }}
                    />
                    {paymentForm.formState.errors.cardNumber && (
                      <span className="error-message">
                        {paymentForm.formState.errors.cardNumber.message}
                      </span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiryDate">
                        {language === 'he' ? 'תאריך תפוגה' : 'Expiry Date'} *
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        {...paymentForm.register('expiryDate')}
                        className={paymentForm.formState.errors.expiryDate ? 'error' : ''}
                        placeholder="MM/YY"
                        maxLength="5"
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value);
                          paymentForm.setValue('expiryDate', formatted);
                        }}
                      />
                      {paymentForm.formState.errors.expiryDate && (
                        <span className="error-message">
                          {paymentForm.formState.errors.expiryDate.message}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="cvv">
                        CVV *
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        {...paymentForm.register('cvv')}
                        className={paymentForm.formState.errors.cvv ? 'error' : ''}
                        placeholder="123"
                        maxLength="4"
                      />
                      {paymentForm.formState.errors.cvv && (
                        <span className="error-message">
                          {paymentForm.formState.errors.cvv.message}
                        </span>
                      )}
                    </div>
                  </div>

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

                  {paymentError && (
                    <span className="error-message">{paymentError}</span>
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="spinner" size={20} />
                          {language === 'he' ? 'מעבד...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          {language === 'he' ? 'שלח הזמנה' : 'Place Order'}
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
