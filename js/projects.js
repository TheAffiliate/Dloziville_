// Footer Auth Button Logic
(function() {
  const client = new Appwrite.Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('680b9ce400285c7afee2');
  const account = new Appwrite.Account(client);
  async function updateFooterAuthButtons() {
    try {
      await account.get();
      document.getElementById('footer-register-btn').classList.add('hidden');
      document.getElementById('footer-login-btn').classList.add('hidden');
      document.getElementById('footer-logout-btn').classList.remove('hidden');
    } catch (error) {
      document.getElementById('footer-register-btn').classList.remove('hidden');
      document.getElementById('footer-login-btn').classList.remove('hidden');
      document.getElementById('footer-logout-btn').classList.add('hidden');
    }
  }
  updateFooterAuthButtons();
  document.getElementById('footer-logout-btn').addEventListener('click', async () => {
    try {
      await account.deleteSession('current');
      window.location.reload();
    } catch (error) {
      alert('Logout failed.');
    }
  });
})();