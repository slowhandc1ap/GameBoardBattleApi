import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { log } from 'console';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const createCheckoutSession = async (req: Request, res: Response) => {
    console.log("== Received Body ==", req.body);


    const { product, information, userId } = req.body;
    console.log("userId:", userId);

    const orderId = uuidv4();
    if (!userId) {
        res.status(400).json({ error: "Missing userId" });
    }


    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'thb',
                    product_data: { name: product.name },
                    unit_amount: product.price * product.quantity * 100,
                },
                quantity: product.quantity,
            }],
            mode: 'payment',
            success_url: `http://localhost:5173/success?id=${orderId}`,
            cancel_url: `http://localhost:5173/cancel?id=${orderId}`
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: "User not found in database" });
            console.log;
            ("User not found in database");
            return
        }
        await prisma.order.create({
            data: {
                orderId,
                userId,
                name: information.name,
                address: information.address,
                amount: product.price * product.quantity,
                status: 'pending',
                stripeSessionId: session.id,
            }
        });

        res.json({ url: session.url }); // ✅ ส่งลิงก์ไป Stripe
        console.log("Checkout session created successfully:", session.url);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Checkout session failed' });
    }
};

export const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature']!;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${(err as Error).message}`);
        return;
    }

    if (event.type === 'checkout.session.completed') {
        const sess = event.data.object as Stripe.Checkout.Session;

        // ✅ หา order จาก stripeSessionId
        const order = await prisma.order.findFirst({
            where: { stripeSessionId: sess.id },
        });

        if (!order) {
            console.error('❌ Order not found for session:', sess.id);
            res.status(404).json({ error: "Order not found" });
            return
        }

        // ✅ อัปเดตสถานะ order และเพิ่ม coin ให้ user
        if (sess.payment_status === 'paid') {
            await prisma.$transaction([
                prisma.order.update({
                    where: { orderId: order.orderId },
                    data: { status: 'paid' },
                }),
                prisma.user.update({
                    where: { id: order.userId },
                    data: {
                        coin: {
                            increment: order.amount // หรือ order.quantity ก็ได้ ถ้าคิดว่า 1 coin = 1 item
                        }
                    }
                })
            ]);

            console.log(`✅ Updated user ${order.userId}: +${order.amount} coins`);
        } else {
            console.log("⚠️ Payment not completed, no coin added.");
        }
    }


    res.json({ received: true });
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        const order = await prisma.order.findUnique({ where: { orderId } });

        if (!order) {
            res.status(404).json({ error: "Not found" });
            return;
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
