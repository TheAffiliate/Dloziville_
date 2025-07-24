
(() => {
  // Initialize Appwrite client
  const client = new Appwrite.Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('680b9ce400285c7afee2');

  const account = new Appwrite.Account(client);
  const databases = new Appwrite.Databases(client);
  const functions = new Appwrite.Functions(client); 

  // Database and collection IDs
  const DATABASE_ID = '680fd941002cc495f230';
  const COLLECTION_ID = '680fd965000bdd163ea9';
  const CONSULTATIONS_COLLECTION_ID = '6829e0db003155d14f5c';
  const ANCESTRY_COLLECTION_ID = '6829de76000aa801cd48';
  const READING_MATERIAL_COLLECTION_ID = '6877c04200294b3653e8'; 
  const ASSIGNMENTS_COLLECTION_ID = '6877c17a0025600adf6d'; 
  const CLAIM_DOCUMENTS_BUCKET_ID = '680fef23003d57bdc9b7'; 

  // Elements
  const totalClaimsEl = document.getElementById("total-claims");
  const pendingClaimsEl = document.getElementById("pending-claims");
  const verifiedClaimsEl = document.getElementById("verified-claims");
  const claimsTableBody = document.getElementById("claims-table-body");
  const searchInput = document.getElementById("search-input");

  const claimModal = document.getElementById("claim-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const approveBtn = document.getElementById("approve-btn");
  const rejectBtn = document.getElementById("reject-btn");
  const deleteBtn = document.getElementById("delete-btn");

  const consultationsList = document.getElementById("general-consultation-list");
  const ancestryList = document.getElementById("ancestry-mapping-list");
  const readingList = document.getElementById("reading-list");
  const assignmentList = document.getElementById("assignment-list");

  // Detail fields mapping
  const detailFields = {
    email: document.getElementById("detail-email"),
    fullNames: document.getElementById("detail-full-names"),
    contactNumber: document.getElementById("detail-contact-number"),
    surnames: document.getElementById("detail-surnames"),
    deedOffice: document.getElementById("detail-deed-office"),
    lpiCode: document.getElementById("detail-lpi-code"),
    farmName: document.getElementById("detail-farm-name"),
    farmNumber: document.getElementById("detail-farm-number"),
    portionNameFarm: document.getElementById("detail-portion-name-farm"),
    registrationDivision: document.getElementById("detail-registration-division"),
    erfNumber: document.getElementById("detail-erf-number"),
    townshipName: document.getElementById("detail-township-name"),
    portionNameErf: document.getElementById("detail-portion-name-erf"),
    holdingArea: document.getElementById("detail-holding-area"),
    holdingNumber: document.getElementById("detail-holding-number"),
    portionNumber: document.getElementById("detail-portion-number"),
    sectionalSchemeName: document.getElementById("detail-sectional-scheme-name"),
    sectionalSchemeNumber: document.getElementById("detail-sectional-scheme-number"),
    sectionalSchemeType: document.getElementById("detail-sectional-scheme-type"),
    filesList: document.getElementById("detail-files-list"),
    status: document.getElementById("detail-status"),
  };

  let entries = [];
  let filteredEntries = [];
  let currentViewIndex = null;
  let currentClaimId = null;

  async function initialize() {
    try {
      const user = await account.get();
      // Only allow these emails
      const allowedEmails = ["kcs888gp@gmail.com", "dloziville.africa@gmail.com"];
      if (!allowedEmails.includes(user.email)) {
        alert("You do not have permission to access this page.");
        window.location.href = "login.html";
        return;
      }
      await loadEntries();
      filterEntries("");
      renderTable();
      updateStats();
      await loadGeneralConsultations();
      await loadAncestryMappings();
      await loadReadingMaterials();
      await loadAssignments();
    } catch (error) {
      console.error("Authentication check failed:", error);
      window.location.href = "login.html";
    }
  }

  async function loadEntries() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
      entries = response.documents;
    } catch (error) {
      console.error("Failed to load claims:", error);
      entries = [];
    }
  }

  function updateStats() {
    totalClaimsEl.textContent = entries.length;
    const pending = entries.filter((e) => e.status === "Pending").length;
    const verified = entries.filter((e) => e.status === "Approved").length;
    pendingClaimsEl.textContent = pending;
    verifiedClaimsEl.textContent = verified;
  }

  function createTableRow(entry, index) {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
    const nameTd = document.createElement("td");
    nameTd.className = "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200";
    nameTd.textContent = entry.fullNames || entry["full-names"] || "N/A";
    const emailTd = document.createElement("td");
    emailTd.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300";
    emailTd.textContent = entry.email || "N/A";
    const statusTd = document.createElement("td");
    statusTd.className = "px-6 py-4 whitespace-nowrap text-sm font-semibold";
    if (entry.status === "Approved") {
      statusTd.classList.add("text-green-600", "dark:text-green-400");
    } else if (entry.status === "Rejected") {
      statusTd.classList.add("text-red-600", "dark:text-red-400");
    } else {
      statusTd.classList.add("text-yellow-600", "dark:text-yellow-400");
    }
    statusTd.textContent = entry.status || "Pending";
    const actionsTd = document.createElement("td");
    actionsTd.className = "px-6 py-4 whitespace-nowrap text-sm";
    const viewBtn = document.createElement("button");
    viewBtn.className = "text-[#e10600] dark:text-[#f87171] hover:underline focus:outline-none";
    viewBtn.textContent = "View";
    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(index);
    });
    actionsTd.appendChild(viewBtn);
    tr.append(nameTd, emailTd, statusTd, actionsTd);
    tr.addEventListener("click", () => openModal(index));
    return tr;
  }

  function renderTable() {
    claimsTableBody.innerHTML = "";
    if (filteredEntries.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.className = "px-6 py-4 text-center text-gray-500 dark:text-gray-400";
      td.textContent = "No claims found.";
      tr.appendChild(td);
      claimsTableBody.appendChild(tr);
      return;
    }
    filteredEntries.forEach((entry, idx) => {
      const originalIndex = entries.indexOf(entry);
      const tr = createTableRow(entry, originalIndex);
      claimsTableBody.appendChild(tr);
    });
  }

  function filterEntries(query) {
    const q = query.toLowerCase();
    filteredEntries = !q ? [...entries] : entries.filter((e) =>
      (e.fullNames && e.fullNames.toLowerCase().includes(q)) ||
      (e["full-names"] && e["full-names"].toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q))
    );
  }

  function openModal(index) {
    currentViewIndex = index;
    const entry = entries[index];
    if (!entry) return;
    currentClaimId = entry.$id;

    detailFields.email.textContent = entry.email || "-";
    detailFields.fullNames.textContent = entry.fullNames || entry["full-names"] || "-";
    detailFields.contactNumber.textContent = entry.contactNumber || entry["contact-number"] || "-";
    detailFields.surnames.textContent = entry.surnames || entry.clanPraise || "-";
    detailFields.deedOffice.textContent = entry.deedOffice || entry["deed-office"] || "-";
    detailFields.lpiCode.textContent = entry.lpiCode || entry["lpi-code"] || "-";
    detailFields.farmName.textContent = entry.farmName || entry["farm-name"] || "-";
    detailFields.farmNumber.textContent = entry.farmNumber || entry["farm-number"] || "-";
    detailFields.portionNameFarm.textContent = entry.portionNameFarm || entry["portion-name-farm"] || "-";
    detailFields.registrationDivision.textContent = entry.registrationDivision || entry["registration-division"] || "-";
    detailFields.erfNumber.textContent = entry.erfNumber || entry["erf-number"] || "-";
    detailFields.townshipName.textContent = entry.townshipName || entry["township-name"] || "-";
    detailFields.portionNameErf.textContent = entry.portionNameErf || entry["portion-name-erf"] || "-";
    detailFields.holdingArea.textContent = entry.holdingArea || entry["holding-area"] || "-";
    detailFields.holdingNumber.textContent = entry.holdingNumber || entry["holding-number"] || "-";
    detailFields.portionNumber.textContent = entry.portionNumber || entry["portion-number"] || "-";
    detailFields.sectionalSchemeName.textContent = entry.sectionalSchemeName || entry["sectional-scheme-name"] || "-";
    detailFields.sectionalSchemeNumber.textContent = entry.sectionalSchemeNumber || entry["sectional-scheme-number"] || "-";
    detailFields.sectionalSchemeType.textContent = entry.sectionalSchemeType || entry["sectional-scheme-type"] || "-";

    detailFields.filesList.innerHTML = "";
    if (entry.files?.length) {
      entry.files.forEach(file => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = file.url || file.fileUrl || "#";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "underline hover:text-[#b00400] dark:hover:text-[#ef4444]";
        a.textContent = file.name || file.fileName || "Document";
        li.appendChild(a);
        detailFields.filesList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "No uploaded documents.";
      detailFields.filesList.appendChild(li);
    }

    detailFields.status.textContent = entry.status || "Pending";
    claimModal.classList.remove("hidden");
  }

  function closeModal() {
    claimModal.classList.add("hidden");
    currentViewIndex = null;
    currentClaimId = null;
  }

  async function approveClaim() {
    if (!currentClaimId) return;
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, currentClaimId, { status: "Approved" });
      await loadEntries();
      filterEntries(searchInput.value);
      renderTable();
      updateStats();
      closeModal();
    } catch (error) {
      alert("Failed to approve claim.");
      console.error(error);
    }
  }

  async function rejectClaim() {
    if (!currentClaimId) return;
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, currentClaimId, { status: "Rejected" });
      await loadEntries();
      filterEntries(searchInput.value);
      renderTable();
      updateStats();
      closeModal();
    } catch (error) {
      alert("Failed to reject claim.");
      console.error(error);
    }
  }

  async function deleteClaim() {
    if (!currentClaimId) return;
    if (!confirm("Are you sure you want to delete this claim?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, currentClaimId);
      await loadEntries();
      filterEntries(searchInput.value);
      renderTable();
      updateStats();
      closeModal();
    } catch (error) {
      alert("Failed to delete claim.");
      console.error(error);
    }
  }

  // Load General Consultations
  async function loadGeneralConsultations() {
    try {
      const res = await databases.listDocuments(DATABASE_ID, CONSULTATIONS_COLLECTION_ID);
      if (!res.documents.length) {
        consultationsList.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500 italic">No consultations found.</td></tr>`;
        return;
      }
      consultationsList.innerHTML = "";
      res.documents.forEach((doc, idx) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700";

        const nameTd = document.createElement("td");
        nameTd.className = "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200";
        nameTd.textContent = doc.name || "N/A";

        const emailTd = document.createElement("td");
        emailTd.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300";
        emailTd.textContent = doc.email || "N/A";

        const preferredDateTd = document.createElement("td");
        preferredDateTd.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300";
        preferredDateTd.textContent = doc.preferred_date ? new Date(doc.preferred_date).toLocaleDateString() : "N/A";

        const submittedAtTd = document.createElement("td");
        submittedAtTd.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300";
        submittedAtTd.textContent = doc.submitted_at ? new Date(doc.submitted_at).toLocaleString() : "N/A";

        const actionsTd = document.createElement("td");
        actionsTd.className = "px-6 py-4 whitespace-nowrap text-sm";

        const viewBtn = document.createElement("button");
        viewBtn.className = "text-[#e10600] dark:text-[#f87171] hover:underline focus:outline-none";
        viewBtn.textContent = "View";
        viewBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openConsultationModal(doc);
        });

        actionsTd.appendChild(viewBtn);

        tr.append(nameTd, emailTd, preferredDateTd, submittedAtTd, actionsTd);
        consultationsList.appendChild(tr);
      });
    } catch (error) {
      consultationsList.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Failed to load data.</td></tr>`;
      console.error('Consultation load error:', error);
    }
  }

  // Load Ancestry Mappings
  async function loadAncestryMappings() {
    try {
      const res = await databases.listDocuments(DATABASE_ID, ANCESTRY_COLLECTION_ID);
      if (!res.documents.length) {
        ancestryList.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500 italic">No ancestry mapping submissions found.</td></tr>`;
        return;
      }
      ancestryList.innerHTML = "";
      res.documents.forEach((doc, idx) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700";

        const nameTd = document.createElement("td");
        nameTd.className = "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200";
        nameTd.textContent = doc.name || "N/A";

        const emailTd = document.createElement("td");
        emailTd.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300";
        emailTd.textContent = doc.email || "N/A";

        const familyDetailsTd = document.createElement("td");
        familyDetailsTd.className = "px-6 py-4 whitespace-normal text-sm text-gray-700 dark:text-gray-300 max-w-xs";
        familyDetailsTd.textContent = doc.family_details || "";

        const submittedAtTd = document.createElement("td");
        submittedAtTd.className = "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300";
        submittedAtTd.textContent = doc.submitted_at ? new Date(doc.submitted_at).toLocaleString() : "N/A";

        const actionsTd = document.createElement("td");
        actionsTd.className = "px-6 py-4 whitespace-nowrap text-sm";

        const viewBtn = document.createElement("button");
        viewBtn.className = "text-[#e10600] dark:text-[#f87171] hover:underline focus:outline-none";
        viewBtn.textContent = "View";
        viewBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openAncestryModal(doc);
        });

        actionsTd.appendChild(viewBtn);

        tr.append(nameTd, emailTd, familyDetailsTd, submittedAtTd, actionsTd);
        ancestryList.appendChild(tr);
      });
    } catch (error) {
      ancestryList.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Failed to load data.</td></tr>`;
      console.error('Ancestry mapping load error:', error);
    }
  }

  // Load Reading Materials
  async function loadReadingMaterials() {
    try {
      if (!READING_MATERIAL_COLLECTION_ID) {
        readingList.innerHTML = `<p class="italic text-gray-400 dark:text-gray-500">Reading material collection ID not set.</p>`;
        return;
      }
      const res = await databases.listDocuments(DATABASE_ID, READING_MATERIAL_COLLECTION_ID);
      if (!res.documents.length) {
        readingList.innerHTML = `<p class="italic text-gray-400 dark:text-gray-500">No reading materials available.</p>`;
        return;
      }
      readingList.innerHTML = "";
      res.documents.forEach(doc => {
        const div = document.createElement("div");
        div.className = "flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded-md p-2";
        const title = document.createElement("span");
        title.textContent = doc.title || "Untitled";
        const link = document.createElement("a");
        link.href = doc.fileUrl || doc.url || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "text-[#e10600] dark:text-[#f87171] hover:underline";
        link.textContent = "View";
        div.append(title, link);
        readingList.appendChild(div);
      });
    } catch (error) {
      readingList.innerHTML = `<p class="text-red-500">Failed to load reading materials.</p>`;
      console.error("Reading materials load error:", error);
    }
  }

  // Load Assignments
  async function loadAssignments() {
    try {
      const res = await databases.listDocuments(DATABASE_ID, ASSIGNMENTS_COLLECTION_ID);
      assignmentList.innerHTML = '';
      if (!res.documents.length) {
        assignmentList.innerHTML = `<p class="italic text-gray-400">No assignments available.</p>`;
        return;
      }
      const storage = new Appwrite.Storage(client);
      res.documents.forEach(doc => {
        const fileId = doc.fileUrl;
        // You can use getFileDownload for download, or getFileView for in-browser view (e.g., PDF)
        // For download:
        const fileUrl = storage.getFileDownload(CLAIM_DOCUMENTS_BUCKET_ID, fileId).href;
        // For in-browser view (uncomment if you want this instead):
        // const fileUrl = storage.getFileView(CLAIM_DOCUMENTS_BUCKET_ID, fileId).href;
        const div = document.createElement('div');
        div.className = 'bg-gray-100 dark:bg-gray-700 rounded-md p-2 flex flex-col md:flex-row md:items-center md:justify-between';
        div.innerHTML = `
          <span class="font-semibold">${doc.title || 'Untitled Assignment'}</span>
          <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">${doc.submitted_by || ''}</span>
          <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">${doc.submitted_at ? new Date(doc.submitted_at).toLocaleString() : ''}</span>
          <a href="${fileUrl}" target="_blank" rel="noopener" class="text-[#e10600] dark:text-[#f87171] hover:underline ml-2">Download</a>
        `;
        assignmentList.appendChild(div);
      });
    } catch (error) {
      assignmentList.innerHTML = `<p class="text-red-500">Failed to load assignments.</p>`;
      console.error("Assignments load error:", error);
    }
  }

  // Modal elements for consultations
  const consultationModal = document.getElementById("consultation-modal");
  const consultationCloseBtn = document.getElementById("consultation-close-btn");
  const cName = document.getElementById("c-name");
  const cEmail = document.getElementById("c-email");
  const cDate = document.getElementById("c-date");
  const cSubmitted = document.getElementById("c-submitted");
  const cResponse = document.getElementById("c-response");
  const consultApproveBtn = document.getElementById("consult-approve-btn");
  const consultRejectBtn = document.getElementById("consult-reject-btn");

  let currentConsultation = null;

  function openConsultationModal(doc) {
    currentConsultation = doc;
    cName.textContent = doc.name || "-";
    cEmail.textContent = doc.email || "-";
    cDate.textContent = doc.preferred_date ? new Date(doc.preferred_date).toLocaleDateString() : "-";
    cSubmitted.textContent = doc.submitted_at ? new Date(doc.submitted_at).toLocaleString() : "-";
    cResponse.value = "";
    consultationModal.classList.remove("hidden");
  }

  function closeConsultationModal() {
    consultationModal.classList.add("hidden");
    currentConsultation = null;
    cResponse.value = "";
  }

  consultationCloseBtn.addEventListener("click", closeConsultationModal);
  consultationModal.addEventListener("click", (e) => {
    if (e.target === consultationModal) closeConsultationModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!claimModal.classList.contains("hidden")) closeModal();
      if (!consultationModal.classList.contains("hidden")) closeConsultationModal();
    }
  });

  consultApproveBtn.addEventListener("click", async () => {
    if (!currentConsultation) return;
    // Implement approval logic here, e.g. update status in DB
    alert(`Approved consultation for ${currentConsultation.name}`);
    closeConsultationModal();
  });

  consultRejectBtn.addEventListener("click", async () => {
    if (!currentConsultation) return;
    // Implement rejection logic here, e.g. update status in DB
    alert(`Rejected consultation for ${currentConsultation.name}`);
    closeConsultationModal();
  });

  modalCloseBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  approveBtn.addEventListener("click", approveClaim);
  rejectBtn.addEventListener("click", rejectClaim);
  deleteBtn.addEventListener("click", deleteClaim);
  searchInput.addEventListener("input", (e) => {
    filterEntries(e.target.value);
    renderTable();
  });
  document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
      await account.deleteSession('current');
      window.location.href = "login.html";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });

  // Handle reading material upload form submission
  const uploadReadingMaterialForm = document.getElementById("upload-reading-material-form");
  if (uploadReadingMaterialForm) {
    uploadReadingMaterialForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = e.target["reading-title"].value.trim();
      const fileInput = e.target["reading-file"];
      if (!title || !fileInput.files.length) {
        alert("Please provide a title and select a file.");
        return;
      }
      try {
        // 1. Upload file to Appwrite Storage (claim documents bucket)
        const storage = new Appwrite.Storage(client);
        const file = fileInput.files[0];
        const uploadResponse = await storage.createFile(
          CLAIM_DOCUMENTS_BUCKET_ID,
          Appwrite.ID.unique(),
          file
        );
        const fileId = uploadResponse.$id;
        // 2. Create a document in the Reading Materials collection
        await databases.createDocument(
          DATABASE_ID,
          READING_MATERIAL_COLLECTION_ID,
          Appwrite.ID.unique(),
          {
            title: title,
            fileUrl: fileId,
            uploaded_at: new Date().toISOString()
          }
        );
        alert("Reading material uploaded successfully!");
        e.target.reset();
        await loadReadingMaterials();
      } catch (error) {
        alert("Failed to upload reading material.");
        console.error(error);
      }
    });
  }

  // Modal elements for ancestry mapping
  const ancestryModal = document.getElementById("ancestry-modal");
  const ancestryCloseBtn = document.getElementById("ancestry-close-btn");
  const amNameDetail = document.getElementById("am-name-detail");
  const amEmailDetail = document.getElementById("am-email-detail");
  const amFamilyDetail = document.getElementById("am-family-detail");
  const amSubmittedDetail = document.getElementById("am-submitted-detail");
  const amResponse = document.getElementById("am-response");
  const amAcceptBtn = document.getElementById("am-accept-btn");
  const amRejectBtn = document.getElementById("am-reject-btn");
  let currentAncestryDoc = null;

  function openAncestryModal(doc) {
    currentAncestryDoc = doc;
    amNameDetail.textContent = doc.name || "-";
    amEmailDetail.textContent = doc.email || "-";
    amFamilyDetail.textContent = doc.family_details || "-";
    amSubmittedDetail.textContent = doc.submitted_at ? new Date(doc.submitted_at).toLocaleString() : "-";
    amResponse.value = "";
    ancestryModal.classList.remove("hidden");
  }

  function closeAncestryModal() {
    ancestryModal.classList.add("hidden");
    currentAncestryDoc = null;
    amResponse.value = "";
  }
  ancestryCloseBtn.addEventListener("click", closeAncestryModal);
  ancestryModal.addEventListener("click", (e) => {
    if (e.target === ancestryModal) closeAncestryModal();
  });

  async function sendAncestryEmail(toEmail, subject, message) {
    const payload = JSON.stringify({ to: toEmail, subject, message });
    return await functions.createExecution('6877a63b002453fde252', payload, true);
  }

  amAcceptBtn.addEventListener("click", async () => {
    if (!currentAncestryDoc) return;
    const reply = amResponse.value.trim();
    if (!reply) {
      alert("Please enter a reply message.");
      return;
    }
    try {
      await sendAncestryEmail(
        currentAncestryDoc.email,
        "Your Ancestry Mapping Request has been Accepted",
        reply
      );
      // Optionally update status in Appwrite
      await databases.updateDocument(DATABASE_ID, ANCESTRY_COLLECTION_ID, currentAncestryDoc.$id, { status: "Accepted" });
      alert("Response sent and request marked as accepted.");
      closeAncestryModal();
      await loadAncestryMappings();
    } catch (error) {
      alert("Failed to send email or update status.");
      console.error(error);
    }
  });

  amRejectBtn.addEventListener("click", async () => {
    if (!currentAncestryDoc) return;
    const reply = amResponse.value.trim();
    if (!reply) {
      alert("Please enter a reply message.");
      return;
    }
    try {
      await sendAncestryEmail(
        currentAncestryDoc.email,
        "Your Ancestry Mapping Request has been Rejected",
        reply
      );
      // Optionally update status in Appwrite
      await databases.updateDocument(DATABASE_ID, ANCESTRY_COLLECTION_ID, currentAncestryDoc.$id, { status: "Rejected" });
      alert("Response sent and request marked as rejected.");
      closeAncestryModal();
      await loadAncestryMappings();
    } catch (error) {
      alert("Failed to send email or update status.");
      console.error(error);
    }
  });

  initialize();
})();