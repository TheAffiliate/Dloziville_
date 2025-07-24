const client = new Appwrite.Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('680b9ce400285c7afee2');

const account = new Appwrite.Account(client);

// On page load: If already logged in, route by email
account.get()
  .then(user => {
    redirectUser(user.email);
  })
  .catch(() => {
    // Stay on page if no session
  });

// Login handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  try {
    await account.createEmailSession(email, password);
    const user = await account.get();
    redirectUser(user.email);
  } catch (error) {
    console.error('Login failed:', error);
    alert('Login failed. Check credentials or session status.');
  }
});

// Role-based redirect function
function redirectUser(email) {
  if (email === 'kcs888gp@gmail.com') {
    window.location.href = 'admin-dashboard.html';
  } else {
    window.location.href = 'index.html';
  }
}