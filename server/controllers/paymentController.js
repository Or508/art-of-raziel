// server/controllers/paymentController.js
// Token-based payment API (mock implementation ready for future Stripe/PayPal integration)
const { sendEmail } = require('../utils/sendEmail');

/**
 * POST /api/payments/charge
 * Body:
 * {
 *   token: string,              // Payment token from frontend / provider (e.g. Stripe, PayPal)
 *   amount: number,             // Amount in smallest currency unit (e.g. cents)
 *   currency: string,           // 'USD', 'ILS', etc.
 *   orderId: string,            // Optional: local order ID reference
 *   customer: {                 // Optional: basic customer info
 *     fullName: string,
 *     email: string
 *   }
 * }
 *
 * For now this is a secure mock that validates the payload and returns a fake transaction id.
 * Later you can plug in a real payment gateway SDK here.
 */

exports.createCharge = async (req, res) => {
  try {
    const { token, amount, currency = 'USD', orderId, customer } = req.body || {};

    // Basic validation
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Payment token is required'
      });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!currency || typeof currency !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Currency is required'
      });
    }

    // IMPORTANT:
    // Here you will integrate with your real payment provider (Stripe, PayPal, Tranzila, etc.)
    //
    // Example (pseudo-code for Stripe):
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const charge = await stripe.paymentIntents.create({
    //   amount,
    //   currency,
    //   payment_method: token,
    //   confirmation_method: 'manual',
    //   confirm: true,
    //   metadata: { orderId, customerEmail: customer?.email || '' }
    // });
    //
    // Then return charge.id as transactionId and charge.status as status.

    // Mock secure processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock transaction id and status
    const transactionId = `TRX-${Date.now()}`;

    // Fire-and-forget admin email notification about the new order/payment
    try {
      const adminSubject = 'New order/payment - Art of Raziel';
      const adminHtml = `
        <h2>New Order / Payment</h2>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p><strong>Order ID:</strong> ${orderId || '-'}</p>
        <p><strong>Amount:</strong> ${amount} ${currency}</p>
        <p><strong>Customer:</strong> ${customer?.fullName || customer?.email || '-'}</p>
        <p><strong>Customer Email:</strong> ${customer?.email || '-'}</p>
      `;

      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: adminSubject,
        html: adminHtml,
      });
    } catch (notifyErr) {
      console.warn('PAYMENT EMAIL WARNING:', notifyErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully (mock)',
      data: {
        transactionId,
        amount,
        currency,
        status: 'approved',
        orderId: orderId || null,
        customer: customer || null
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment processing failed'
    });
  }
};

