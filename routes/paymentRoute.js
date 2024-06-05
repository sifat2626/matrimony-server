const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const mongoose = require('mongoose');
const User = require('../models/UserModel'); // Adjust the path to your User model
const router = express.Router();

router.use(express.json());

router.post('/create-payment-intent', async (req, res) => {
    const { amount, email, biodataId } = req.body;

    if (amount !== 500) { // Assuming amount is in cents (i.e., $5.00)
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: { email, biodataId },
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = 'your-webhook-secret'; // Replace with your actual webhook secret

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const email = paymentIntent.metadata.email;

            try {
                // Update user premiumStatus to Pending
                const user = await User.findOne({ email });
                if (user) {
                    user.premiumStatus = 'Pending';
                    await user.save();
                }
            } catch (error) {
                console.error('Failed to update user premiumStatus:', error);
            }

            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.sendStatus(200);
});

module.exports = router;
