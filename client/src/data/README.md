# Mock Data Documentation

## Overview
This directory contains mock data for testing and development purposes.

## Files

### `mockOrders.js`
Contains 5 realistic sample orders from different countries for testing the International Order System.

## Sample Orders

1. **ORD-2024-001** (USA)
   - Customer: Sarah Cohen
   - Product: Large Mezuzah
   - Status: Pending
   - Amount: $250.00 USD

2. **ORD-2024-002** (Israel)
   - Customer: דוד לוי
   - Product: Seal of Solomon
   - Status: Shipped
   - Amount: ₪600.00 ILS

3. **ORD-2024-003** (France)
   - Customer: Marie Dubois
   - Products: Success Amulet, Love Amulet, 2x Medium Mezuzah
   - Status: Processing
   - Amount: €1,330.00 EUR

4. **ORD-2024-004** (USA)
   - Customer: Michael Rosen
   - Product: Protection Amulet
   - Status: Delivered
   - Amount: $500.00 USD

5. **ORD-2024-005** (Israel)
   - Customer: רחל אברהם
   - Products: Health Amulet, Prosperity Amulet, Large Mezuzah
   - Status: Paid
   - Amount: ₪1,250.00 ILS

## Helper Functions

- `getOrdersByStatus(status)` - Filter orders by status
- `getOrdersByCountry(countryCode)` - Filter orders by country
- `getOrderById(orderId)` - Find order by ID
- `getTotalRevenue(currency)` - Calculate total revenue (optionally filtered by currency)

## Usage Example

```javascript
import { mockOrders, getOrdersByStatus, getOrderById } from './data/mockOrders';

// Get all pending orders
const pendingOrders = getOrdersByStatus('Pending');

// Get specific order
const order = getOrderById('ORD-2024-001');

// Get all orders
const allOrders = mockOrders;
```
