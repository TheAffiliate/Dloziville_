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
gcForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = gcForm['gc-name'].value.trim();
  const email = gcForm['gc-email'].value.trim();
  const contact = gcForm['gc-contact'].value.trim();
  if (!name || !email || !contact) {
    document.getElementById('gc-message').textContent = 'Please fill in all fields.';
    return;
  }
  const formData = {
    service: 'General Consultation',
    name,
    email,
    contact,
    amount: 800,
    itemName: 'General Consultation'
  };
  sessionStorage.setItem('serviceFormData', JSON.stringify(formData));
  window.location.href = 'checkout.html?service=general-consultation';
});

// Ancestry Mapping Form
const amForm = document.getElementById('ancestry-mapping-form');
amForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = amForm['am-name'].value.trim();
  const email = amForm['am-email'].value.trim();
  const contact = amForm['am-contact'].value.trim();
  const surnameInputs = amForm.querySelectorAll('input[name="surname[]"]');
  const surnames = Array.from(surnameInputs).map(input => input.value.trim()).filter(Boolean);
  if (!name || !email || !contact || surnames.length === 0) {
    document.getElementById('am-message').textContent = 'Please fill in all required fields.';
    return;
  }
  const amount = 699 * surnames.length;
  const formData = {
    service: 'Ancestry Mapping',
    name,
    email,
    contact,
    surnames,
    amount,
    itemName: `Ancestry Mapping (${surnames.length} surname${surnames.length > 1 ? 's' : ''})`
  };
  sessionStorage.setItem('serviceFormData', JSON.stringify(formData));
  window.location.href = 'checkout.html?service=ancestry-mapping';
});

// Add another surname field for Ancestry Mapping
const addSurnameBtn = document.getElementById('add-surname-btn');
if (addSurnameBtn) {
  addSurnameBtn.addEventListener('click', () => {
    const surnameFields = document.getElementById('surname-fields');
    const div = document.createElement('div');
    div.className = 'flex space-x-2 mb-2';
    div.innerHTML = `<input type="text" name="surname[]" required placeholder="Surname, Clan Praises, Province/Region" class="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200" />`;
    surnameFields.appendChild(div);
  });
}

// Land Restoration Form
const lrForm = document.getElementById('land-restoration-form');
lrForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = lrForm['lr-name'].value.trim();
  const email = lrForm['lr-email'].value.trim();
  const contact = lrForm['lr-contact'].value.trim();
  if (!name || !email || !contact) {
    document.getElementById('lr-message').textContent = 'Please fill in all fields.';
    return;
  }
  const formData = {
    service: 'Land Restoration',
    name,
    email,
    contact,
    amount: 799,
    itemName: 'Land Restoration (Initial Consultation)'
  };
  sessionStorage.setItem('serviceFormData', JSON.stringify(formData));
  window.location.href = 'checkout.html?service=land-restoration';
});