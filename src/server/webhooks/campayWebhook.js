const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../../config/firebase');
const { doc, updateDoc, getDoc } = require('firebase/firestore');

// Verify Campay webhook signature
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-campay-signature'];
  const webhookKey = '8JYaELykYbtAb1kFFWmvSS6-WVRks4ZB63pNJj9-mJJim1516DcK0d5o8sMXzZ8xpmcs7ehRRQGQsxF-010UEQ';

  if (!signature || !webhookKey) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  // Create HMAC hash
  const hmac = crypto.createHmac('sha256', webhookKey);
  const payload = JSON.stringify(req.body);
  const calculatedSignature = hmac.update(payload).digest('hex');

  // Compare signatures
  if (signature !== calculatedSignature) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  next();
};

// Handle payment status updates
router.post('/payment-status', verifyWebhookSignature, async (req, res) => {
  try {
    const { reference, status, external_id } = req.body;

    if (!reference || !status || !external_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update payment record in Firestore
    const paymentRef = doc(db, 'payments', external_id);
    const paymentDoc = await getDoc(paymentRef);

    if (!paymentDoc.exists()) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    const paymentData = paymentDoc.data();
    const updates = {
      status: status.toLowerCase(),
      updatedAt: new Date().toISOString(),
      campayReference: reference
    };

    // If payment is successful, update additional fields
    if (status === 'SUCCESS') {
      updates.completedAt = new Date().toISOString();
      
      // Update project status if it exists
      if (paymentData.projectId) {
        const projectRef = doc(db, 'projects', paymentData.projectId);
        await updateDoc(projectRef, {
          'payment.status': 'completed',
          'payment.lastUpdated': new Date().toISOString(),
          'payment.lastAmount': paymentData.amount
        });
      }
    }

    // Update payment record
    await updateDoc(paymentRef, updates);

    // Log the webhook event
    console.log(`Payment ${external_id} status updated to ${status}`);

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 