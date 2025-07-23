import { useState } from 'react';

export default function Checkout() {
  const [amount, setAmount] = useState('100.00');
  const [itemName, setItemName] = useState('Test Product');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/payfast-initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        item_name: itemName,
        email,
      }),
    });
    const data = await res.json();
    window.location.href = data.url; // Redirect to PayFast
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handlePay} className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-white mb-4">Pay with PayFast</h1>
        <input
          type="text"
          placeholder="Amount (e.g. 100.00)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          required
        />
        <button
          type="submit"
          className="w-full py-3 rounded bg-primary-color text-white font-semibold text-lg hover:bg-red-700 transition"
          disabled={loading}
        >
          {loading ? 'Redirecting...' : 'Pay with PayFast'}
        </button>
      </form>
    </div>
  );
}