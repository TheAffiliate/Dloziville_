import { useState, useEffect } from 'react';

export default function Checkout() {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Retrieve form data from sessionStorage
    const data = sessionStorage.getItem('serviceFormData');
    if (data) {
      setFormData(JSON.parse(data));
    }
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/payfast-initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: formData.amount,
        item_name: formData.itemName,
        email: formData.email,
      }),
    });
    const data = await res.json();
    window.location.href = data.url; // Redirect to PayFast
  };

  // Simulate payment success for demo (in real use, handle on /payment-success page)
  useEffect(() => {
    // Check if redirected back from PayFast (e.g., ?payment=success)
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && formData && !submitted) {
      // Submit to Appwrite
      const submitData = async () => {
        setLoading(true);
        try {
          // Dynamically import Appwrite SDK (assumes it's loaded globally in HTML for static site)
          const client = new window.Appwrite.Client()
            .setEndpoint('https://fra.cloud.appwrite.io/v1')
            .setProject('680b9ce400285c7afee2');
          const databases = new window.Appwrite.Databases(client);
          const DATABASE_ID = '680fd941002cc495f230';
          let collectionId = '';
          let docData = {};
          if (formData.service === 'General Consultation') {
            collectionId = '6829e0db003155d14f5c';
            docData = {
              name: formData.name,
              email: formData.email,
              contact: formData.contact,
              submitted_at: new Date().toISOString(),
            };
          } else if (formData.service === 'Ancestry Mapping') {
            collectionId = '6829de76000aa801cd48';
            docData = {
              name: formData.name,
              email: formData.email,
              contact: formData.contact,
              surnames: formData.surnames,
              submitted_at: new Date().toISOString(),
            };
          } else if (formData.service === 'Land Restoration') {
            collectionId = '680fd965000bdd163ea9';
            docData = {
              name: formData.name,
              email: formData.email,
              contact: formData.contact,
              submitted_at: new Date().toISOString(),
            };
          }
          await databases.createDocument(DATABASE_ID, collectionId, 'unique()', docData);
          setSubmitted(true);
          sessionStorage.removeItem('serviceFormData');
        } catch (error) {
          alert('Submission failed. Please contact support.');
        } finally {
          setLoading(false);
        }
      };
      submitData();
    }
  }, [formData, submitted]);

  if (!formData) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">No service form data found. Please start from the service page.</div>;
  }

  if (submitted) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-green-400 text-xl">Thank you! Your submission was successful.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handlePay} className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-white mb-4">Pay with PayFast</h1>
        <div className="mb-2 text-gray-200">
          <div><span className="font-semibold">Service:</span> {formData.service}</div>
          <div><span className="font-semibold">Name:</span> {formData.name}</div>
          <div><span className="font-semibold">Email:</span> {formData.email}</div>
          <div><span className="font-semibold">Contact:</span> {formData.contact}</div>
          {formData.surnames && (
            <div><span className="font-semibold">Surnames:</span> {formData.surnames.join(', ')}</div>
          )}
          <div><span className="font-semibold">Amount:</span> R{formData.amount}</div>
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded bg-primary-color text-white font-semibold text-lg hover:bg-red-700 transition"
          disabled={loading}
        >
          {loading ? 'Redirecting...' : `Pay R${formData.amount} with PayFast`}
        </button>
      </form>
    </div>
  );
}