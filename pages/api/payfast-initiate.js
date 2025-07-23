import md5 from 'crypto-js/md5';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { amount, item_name, email } = req.body;

  const params = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    amount,
    item_name,
    email_address: email,
    return_url: 'https://yourdomain.com/payment-success',
    cancel_url: 'https://yourdomain.com/payment-cancel',
    notify_url: 'https://yourdomain.com/api/payfast-itn',
  };

  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');

  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  const signatureString = queryString + (passphrase ? `&passphrase=${encodeURIComponent(passphrase)}` : '');
  const signature = md5(signatureString).toString();

  const payfastUrl = `https://www.payfast.co.za/eng/process?${queryString}&signature=${signature}`;

  res.status(200).json({ url: payfastUrl });
}