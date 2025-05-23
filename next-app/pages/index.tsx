// next-app/pages/index.tsx
import { useState } from 'react';

export default function Home() {
  const [jdUrl, setJdUrl] = useState('');
  const [cvText, setCvText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jdUrl, cvText }),
    });
    const { id } = await res.json();
    window.location.href = id
      ? `https://checkout.stripe.com/pay/${id}`
      : '/';
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: 'auto' }}>
      <h1>AI Résumé Optimizer</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Job Description URL:
          <input
            type="url"
            value={jdUrl}
            onChange={e => setJdUrl(e.target.value)}
            required
            style={{ width: '100%', margin: '0.5rem 0' }}
          />
        </label>
        <label>
          Current Résumé Text:
          <textarea
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            required
            rows={6}
            style={{ width: '100%', margin: '0.5rem 0' }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
          {loading ? 'Processing…' : 'Purchase & Generate'}
        </button>
      </form>
    </div>
  );
}
