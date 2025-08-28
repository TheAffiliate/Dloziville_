
document.addEventListener('DOMContentLoaded', function() {
  const client = new Appwrite.Client()
    .setEndpoint(CONFIG.APPWRITE.ENDPOINT)
    .setProject(CONFIG.APPWRITE.PROJECT_ID);
  const account = new Appwrite.Account(client);

  // Check for secure session
  const sessionId = sessionStorage.getItem('sessionId');
  let currentSession = null;
  
  if (sessionId) {
    currentSession = securityManager.getSession(sessionId);
    if (!currentSession) {
      // Session expired, clear storage
      sessionStorage.removeItem('sessionId');
    }
  }

  // Show logged-in content if user is authenticated
  account.get().then(() => {
    document.getElementById('auth-only-content').classList.remove('hidden');
  });

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
      
      // Clear secure session
      const sessionId = sessionStorage.getItem('sessionId');
      if (sessionId) {
        securityManager.destroySession(sessionId);
        sessionStorage.removeItem('sessionId');
      }
      
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force reload even if Appwrite logout fails
      window.location.reload();
    }
  });

  const databases = new Appwrite.Databases(client);
  const storage = new Appwrite.Storage(client);

  document.getElementById('upload-assignment-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = e.target['assignment-title'].value.trim();
    const fileInput = e.target['assignment-file'];
    if (!title || fileInput.files.length === 0) return;

    try {
      // 1. Validate file upload
      const file = fileInput.files[0];
      
      try {
        SecurityManager.validateFileUpload(file);
      } catch (error) {
        alert(error.message);
        return;
      }
      
      // 2. Upload file to Appwrite Storage
      const uploadResponse = await storage.createFile(
        CONFIG.APPWRITE.STORAGE.CLAIM_DOCUMENTS,
        Appwrite.ID.unique(),
        file
      );
      const fileId = uploadResponse.$id;

      // 2. Get the current user (for submitted_by)
      let submittedBy = '';
      try {
        const user = await account.get();
        submittedBy = user.email || user.name || user.$id;
      } catch {
        submittedBy = 'Anonymous';
      }

      // 3. Create a document in the Assignments collection
      await databases.createDocument(
        CONFIG.APPWRITE.DATABASE_ID,
        CONFIG.APPWRITE.COLLECTIONS.ASSIGNMENTS,
        Appwrite.ID.unique(),
        {
          title: SecurityManager.sanitizeInput(title),
          fileUrl: fileId,
          submitted_by: SecurityManager.sanitizeInput(submittedBy),
          submitted_at: new Date().toISOString()
        }
      );

      alert('Assignment uploaded successfully!');
      e.target.reset();
      // Optionally, reload the assignment list here
    } catch (error) {
      alert('Failed to upload assignment.');
      console.error(error);
    }
  });

  async function loadReadingMaterials() {
    console.log('Loading reading materials...');
    const readingList = document.getElementById('reading-list');
    try {
      const res = await databases.listDocuments(CONFIG.APPWRITE.DATABASE_ID, CONFIG.APPWRITE.COLLECTIONS.READING_MATERIAL);
      console.log('Fetched documents:', res.documents);
      if (!res.documents.length) {
        readingList.innerHTML = `<p class="italic text-gray-400">No reading materials available.</p>`;
        return;
      }
      readingList.innerHTML = '';
      for (const doc of res.documents) {
        const fileId = doc.fileUrl;
        // Generate a download URL for the file
        const fileUrl = storage.getFileDownload(CONFIG.APPWRITE.STORAGE.CLAIM_DOCUMENTS, fileId).href;
        const div = document.createElement('div');
        div.className = 'bg-gray-700 rounded-md p-3 flex justify-between items-center';
        div.innerHTML = `
          <span>${doc.title || 'Untitled'}</span>
          <a href="${fileUrl}" class="text-primary-color hover:underline" target="_blank" rel="noopener">Download</a>
        `;
        readingList.appendChild(div);
      }
    } catch (error) {
      readingList.innerHTML = `<p class="text-red-500">Failed to load reading materials.</p>`;
      console.error('Reading materials load error:', error); 
    }
  }

  // Call this after user is authenticated and #reading-list is visible
  account.get().then(() => {
    document.getElementById('auth-only-content').classList.remove('hidden');
    loadReadingMaterials();
  });
});
