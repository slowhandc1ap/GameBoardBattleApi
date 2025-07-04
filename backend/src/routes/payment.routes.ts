import express from 'express';
import {
  createCheckoutSession,
  stripeWebhook,
  getOrder
} from '../controllers/payment.controller';

const router = express.Router();

router.post('/checkout', createCheckoutSession); // ไม่ต้องใส่ express.json() แล้ว
router.post('/webhook', stripeWebhook);
router.get('/order/:orderId', getOrder);

export default router;
