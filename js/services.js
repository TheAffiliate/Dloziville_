const client = new Appwrite.Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('680b9ce400285c7afee2');

const databases = new Appwrite.Databases(client);
const storage = new Appwrite.Storage(client);

const DATABASE_ID = '680fd941002cc495f230';
const CONSULTATION_COLLECTION_ID = '6829e0db003155d14f5c';
const ANCESTRY_COLLECTION_ID = '6829de76000aa801cd48';
const CLAIMS_COLLECTION_ID = '680fd965000bdd163ea9';
const DOCUMENTS_COLLECTION_ID = '680fd979003271a580d4';
const CLAIM_DOCUMENTS_BUCKET_ID = '680fef23003d57bdc9b7';

// Dropdown toggles
function toggleDropdown(buttonId, dropdownId) {
  const button = document.getElementById(buttonId);
  const dropdown = document.getElementById(dropdownId);
  const icon = button.querySelector('i.fas.fa-chevron-down');

  button.addEventListener('click', () => {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    dropdown.classList.toggle('hidden', isExpanded);
    button.setAttribute('aria-expanded', !isExpanded);
    icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
  });
}

toggleDropdown('general-consultation-toggle', 'general-consultation-dropdown');
toggleDropdown('ancestry-mapping-toggle', 'ancestry-mapping-dropdown');
toggleDropdown('land-restoration-toggle', 'land-restoration-dropdown');
document.getElementById('gc-date').setAttribute('min', new Date().toISOString().split('T')[0]);

// General Consultation Form
const gcForm = document.getElementById('general-consultation-form');
const gcMessage = document.getElementById('gc-message');
gcForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  gcMessage.textContent = '';

  const name = gcForm['gc-name'].value.trim();
  const email = gcForm['gc-email'].value.trim();
  const preferredDate = gcForm['gc-date'].value;

  if (!name || !email || !preferredDate) {
    gcMessage.textContent = 'Please fill in all fields.';
    gcMessage.classList.replace('text-green-400', 'text-red-500');
    return;
  }

  try {
    await databases.createDocument(DATABASE_ID, CONSULTATION_COLLECTION_ID, 'unique()', {
      name,
      email,
      preferred_date: preferredDate,
      submitted_at: new Date().toISOString()
    });
    gcMessage.textContent = `Thank you, ${name}. Your consultation is booked for ${preferredDate}.`;
    gcMessage.classList.replace('text-red-500', 'text-green-400');
    gcForm.reset();
    document.getElementById('general-consultation-dropdown').classList.add('hidden');
    // Redirect to checkout with payment details
    window.location.href = `/checkout?amount=250.00&item_name=Consultation&email=${encodeURIComponent(email)}`;
  } catch (error) {
    console.error('Submit error:', error);
    gcMessage.textContent = 'Submission failed.';
    gcMessage.classList.replace('text-green-400', 'text-red-500');
  }
});

// Ancestry Mapping Form
const amForm = document.getElementById('ancestry-mapping-form');
const amMessage = document.getElementById('am-message');
amForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  amMessage.textContent = '';

  const name = amForm['am-name'].value.trim();
  const email = amForm['am-email'].value.trim();
  const details = amForm['am-details'].value.trim();

  if (!name || !email) {
    amMessage.textContent = 'Please fill in all required fields.';
    amMessage.classList.replace('text-green-400', 'text-red-500');
    return;
  }

  try {
    await databases.createDocument(DATABASE_ID, ANCESTRY_COLLECTION_ID, 'unique()', {
      name,
      email,
      family_details: details,
      submitted_at: new Date().toISOString()
    });
    amMessage.textContent = `Thank you, ${name}. Your ancestry mapping request has been received.`;
    amMessage.classList.replace('text-red-500', 'text-green-400');
    amForm.reset();
    document.getElementById('ancestry-mapping-dropdown').classList.add('hidden');
    // Redirect to checkout with payment details
    window.location.href = `/checkout?amount=350.00&item_name=Ancestry%20Mapping&email=${encodeURIComponent(email)}`;
  } catch (error) {
    console.error('Submit error:', error);
    amMessage.textContent = 'Submission failed.';
    amMessage.classList.replace('text-green-400', 'text-red-500');
  }
});