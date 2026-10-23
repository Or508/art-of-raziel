# Order Types Documentation

## Overview
This directory contains type definitions for the International Order System, designed for a high-end global e-commerce platform.

## Files

### `orderTypes.js`
Contains JSDoc type definitions and utility functions for order management:

#### Type Definitions:
- **`PhoneNumber`**: Phone number structure with country code
- **`ShippingAddress`**: Global shipping address format
- **`OrderItem`**: Individual product item in an order
- **`OrderStatus`**: Enum for order statuses (`Pending`, `Paid`, `Processing`, `Shipped`, `Delivered`, `Cancelled`)
- **`Order`**: Complete order structure
- **`OrderFormData`**: Form data structure for order creation

#### Utility Functions:
- `validateEmail(email)` - Email validation
- `validatePhone(phone)` - Phone number validation
- `validateZipCode(zipCode)` - ZIP/postal code validation
- `formatPhoneNumber(phone)` - Format phone for display
- `getCurrencySymbol(currencyCode)` - Get currency symbol
- `formatCurrency(amount, currency)` - Format currency amount

## Usage Example

```javascript
import { validateEmail, formatCurrency } from '../types/orderTypes';

// Validate email
const isValid = validateEmail('customer@example.com');

// Format currency
const formatted = formatCurrency(250.00, 'USD'); // "$250.00"
```

## Data Structure

### Order Object Structure:
```javascript
{
  id: "ORD-2024-001",
  customer: {
    fullName: "John Doe",
    email: "john@example.com",
    phone: {
      countryCode: "+1",
      number: "(212) 555-0147"
    }
  },
  shippingAddress: {
    streetAddress: "123 Main St",
    city: "New York",
    stateOrProvince: "NY", // Optional
    zipCode: "10001",
    country: "US"
  },
  items: [
    {
      productId: "MEZ-LRG-001",
      title: "Large Mezuzah",
      price: 250.00,
      quantity: 1,
      total: 250.00
    }
  ],
  totalAmount: 250.00,
  currency: "USD",
  status: "Pending",
  paymentId: "PAY-STRIPE-abc123",
  createdAt: "2024-01-15T10:30:00Z",
  trackingNumber: null, // Optional
  notes: null // Optional
}
```
