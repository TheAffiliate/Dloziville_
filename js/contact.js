const client = new Appwrite.Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('680b9ce400285c7afee2');

const account = new Appwrite.Account(client);

// Check if user is logged in
account.get()
  .then(() => {
    document.getElementById('logout-button').classList.remove('hidden');
    document.getElementById('login-link').classList.add('hidden');
    document.getElementById('register-link').classList.add('hidden');
  })
  .catch(() => {
    document.getElementById('logout-button').classList.add('hidden');
    document.getElementById('login-link').classList.remove('hidden');
    document.getElementById('register-link').classList.remove('hidden');
  });

// Logout handler
document.getElementById('logout-button')?.addEventListener('click', async () => {
  try {
    await account.deleteSession('current');
    window.location.href = 'login.html';
  } catch (err) {
    alert('Failed to logout. Try again.');
  }
});

// Contact form submission handler
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formMessage.textContent = '';
  formMessage.classList.remove('text-red-500', 'text-green-400');

  const name = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  const subject = contactForm.subject.value.trim();
  const message = contactForm.message.value.trim();

  if (!name || !email || !subject || !message) {
    formMessage.textContent = 'Please fill in all fields.';
    formMessage.classList.add('text-red-500');
    return;
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    formMessage.textContent = 'Please enter a valid email address.';
    formMessage.classList.add('text-red-500');
    return;
  }

  // Simulate sending message (since no backend)
  formMessage.textContent = 'Thank you for contacting us! We will get back to you shortly.';
  formMessage.classList.add('text-green-400');
  contactForm.reset();
});