
document.addEventListener('DOMContentLoaded', function() {
  const client = new Appwrite.Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('680b9ce400285c7afee2');
  const account = new Appwrite.Account(client);

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
      window.location.reload();
    } catch (error) {
      alert('Logout failed.');
    }
  });

  const databases = new Appwrite.Databases(client);
  const storage = new Appwrite.Storage(client);
  const DATABASE_ID = '680fd941002cc495f230';
  const ASSIGNMENTS_COLLECTION_ID = '6877c17a0025600adf6d';
  const CLAIM_DOCUMENTS_BUCKET_ID = '680fef23003d57bdc9b7';

  document.getElementById('upload-assignment-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = e.target['assignment-title'].value.trim();
    const fileInput = e.target['assignment-file'];
    if (!title || fileInput.files.length === 0) return;

    try {
      // 1. Upload file to Appwrite Storage
      const file = fileInput.files[0];
      const uploadResponse = await storage.createFile(
        CLAIM_DOCUMENTS_BUCKET_ID,
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
        DATABASE_ID,
        ASSIGNMENTS_COLLECTION_ID,
        Appwrite.ID.unique(),
        {
          title: title,
          fileUrl: fileId,
          submitted_by: submittedBy,
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

  const READING_MATERIAL_COLLECTION_ID = '6877c04200294b3653e8';
  async function loadReadingMaterials() {
    console.log('Loading reading materials...');
    const readingList = document.getElementById('reading-list');
    try {
      const res = await databases.listDocuments(DATABASE_ID, READING_MATERIAL_COLLECTION_ID);
      console.log('Fetched documents:', res.documents);
      if (!res.documents.length) {
        readingList.innerHTML = `<p class="italic text-gray-400">No reading materials available.</p>`;
        return;
      }
      readingList.innerHTML = '';
      for (const doc of res.documents) {
        const fileId = doc.fileUrl;
        // Generate a download URL for the file
        const fileUrl = storage.getFileDownload(CLAIM_DOCUMENTS_BUCKET_ID, fileId).href;
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
