const client = new Appwrite.Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('680b9ce400285c7afee2');

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);

// Check for active session
account.get()
  .then(async (user) => {
    const profileList = await databases.listDocuments(
      '680fd941002cc495f230',
      '682a4296002b063adac9',
      [Appwrite.Query.equal('userId', user.$id)]
    );
    const userProfile = profileList.documents[0];
    if (userProfile?.role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'index.html';
    }
  })
  .catch(() => {});

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;

  ['name', 'email', 'password', 'password-confirm'].forEach(id =>
    document.getElementById(`${id}-error`).classList.add('hidden')
  );

  let hasError = false;
  if (name.length < 2) {
    document.getElementById('name-error').classList.remove('hidden');
    hasError = true;
  }
  if (!validateEmail(email)) {
    document.getElementById('email-error').classList.remove('hidden');
    hasError = true;
  }
  if (password.length < 6) {
    document.getElementById('password-error').classList.remove('hidden');
    hasError = true;
  }
  if (password !== passwordConfirm) {
    document.getElementById('password-confirm-error').classList.remove('hidden');
    hasError = true;
  }
  if (hasError) return;

  const button = e.target.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Registering...';

  try {
    const user = await account.create(Appwrite.ID.unique(), email, password, name);
    await account.createEmailSession(email, password);

    // Create user profile
    await databases.createDocument(
      '680fd941002cc495f230',
      '682a4296002b063adac9',
      Appwrite.ID.unique(),
      {
        userId: user.$id,
        fullName: name,
        email: email,
        role: 'user'
      },
      [
        Appwrite.Permission.read(Appwrite.Role.user(user.$id)),
        Appwrite.Permission.update(Appwrite.Role.user(user.$id)),
        Appwrite.Permission.delete(Appwrite.Role.user(user.$id))
      ]
    );

    // Check role and redirect accordingly
    const profileList = await databases.listDocuments(
      '680fd941002cc495f230',
      '682a4296002b063adac9',
      [Appwrite.Query.equal('userId', user.$id)]
    );

    const userProfile = profileList.documents[0];
    if (userProfile?.role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'index.html';
    }

  } catch (error) {
    console.error('Registration failed:', error);
    if (error.code === 409) {
      alert('An account with this email already exists.');
    } else {
      alert(error.message || 'Registration failed. Please try again.');
    }
  } finally {
    button.disabled = false;
    button.textContent = 'Register';
  }
});