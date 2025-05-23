import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SK!, { apiVersion: '2023-10-16' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Only POST');
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: process.env.NEXT_PUBLIC_PRICE_ONEOFF!, quantity: 1 }],
      mode: 'payment',
      success_url: process.env.NEXT_PUBLIC_SUCCESS_URL!,
      cancel_url: process.env.NEXT_PUBLIC_CANCEL_URL!,
      metadata: {
        // 後続処理で使う JD や CV のテキストをここに入れます
        jd_url: req.body.jdUrl,
        cv_text: req.body.cvText,
      },
    });
    res.json({ id: session.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Stripe error' });
  }
}
