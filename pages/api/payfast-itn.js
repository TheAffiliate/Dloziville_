export default async function handler(req, res) {
  // PayFast will POST to this endpoint
  // You must validate the ITN (see PayFast docs for full security)
  // For now, just log and return 200
  console.log('PayFast ITN received:', req.body);

  // TODO: Validate signature, source IP, and update your DB

  res.status(200).send('OK');
}