/**
 * Stripe Webhook → Google Pub/Sub forwarder
 */
const functions = require('@google-cloud/functions-framework');
const { PubSub } = require('@google-cloud/pubsub');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SK, { apiVersion: '2023-10-16' });
const pubsub = new PubSub();
const topic = pubsub.topic(process.env.PUBSUB_TOPIC);

functions.http('stripeWebhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_ENDPOINT_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // checkout.session.completed のみ Pub/Sub へ流す
  if (event.type === 'checkout.session.completed') {
    await topic.publishMessage({ json: event });
  }
  res.json({ received: true });
});
