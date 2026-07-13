const API_KEY = "https://ooulostandfoundportal.onrender.com";

// --- PRIMARY VALIDATION & SUBMISSION ENGINE ---
async function handleReportSubmission(reportType) {
  // Target DOM Nodes dynamically
  const itemName = document.querySelector('#itemName');
  const itemCategory = document.querySelector('#itemCategory');
  const itemDate = document.querySelector('#dateLost') || document.querySelector('#dateFound');
  const itemLocation = document.querySelector('#locationLost') || document.querySelector('#locationFound');
  const itemDescription = document.querySelector('#itemDescription');

  // Validations
  if (!itemCategory || itemCategory.value === '') {
    alert('Please select a category');
    return;
  }
  if (!itemName || itemName.value.trim() === '') {
    alert('Please enter the item name');
    return;
  }

  // 🔑 Token Extraction
  let token = localStorage.getItem('token');
  if (!token && localStorage.getItem('cuser')) {
    const parsedUser = JSON.parse(localStorage.getItem('cuser'));
    token = parsedUser.token || parsedUser.accessToken; 
  }

  if (!token) {
    alert('Session expired. Please log in again.');
    return;
  }

  // 👤 Extracting Real User Profile Details Safely
  const cachedUser = localStorage.getItem('user') || localStorage.getItem('cuser');
  let reporterId = null;
  let reporterName = "";
  let reporterEmail = "";
  let reporterMatricId = "";
  let reporterPhone = "";

  if (cachedUser) {
    try {
      const parsedData = JSON.parse(cachedUser);
      
      // Detour logic: check if data is nested inside a ".user" object, otherwise use root
      const userProfile = parsedData.user || parsedData;

      // Map out your real data fields cleanly
      reporterId = userProfile._id || userProfile.id || userProfile.userId; 
      reporterName = userProfile.name || userProfile.fullName || userProfile.username || "";
      reporterEmail = userProfile.email || "";
      reporterMatricId = userProfile.matricId || userProfile.staffId || userProfile.matricNo || userProfile.matricNumber || "";
      reporterPhone = userProfile.phone || userProfile.phoneNumber || "";
    } catch (e) {
      console.error("Error reading profile data from storage:", e);
    }
  }

  // 📦 Build Unified Payload Layout
  const reportPayload = {
    name: itemName.value.trim(),
    description: itemDescription?.value || "No description provided.",
    imgUrl: "https://placehold.co/600x400?text=No+Image+Provided", 
    
    // 🔑 Identity mapping
    founder: reporterId, 
    reporterId: reporterId,
    
    // ✨ Real User Meta Details
    reporterName: reporterName,
    reporterEmail: reporterEmail,
    reporterMatricId: reporterMatricId,
    reporterPhone: reporterPhone,

    foundLocation: itemLocation?.value || "Unknown Location", 
    foundDate: itemDate?.value || new Date().toISOString().split('T')[0], 
    category: itemCategory.value,
    type: reportType, 
    status: "Available" 
  };

  try {
    const response = await fetch(`${API_KEY}/user/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reportPayload)
    });

    const data = await response.json();

    if (response.ok || data.success) {
      alert(`Item reported successfully!`);
      window.location.href = './history.html'; 
    } else {
      alert(data.message || "Submission rejected by portal server");
    }
  } catch (error) {
    console.error("Transmission Failure:", error);
    alert('Network transmission failed.');
  }
}

// --- INITIALIZE EVENT LISTENERS BASED ON ACTIVE PAGE ---
document.addEventListener('DOMContentLoaded', () => {
  const lostBtn = document.querySelector('#submitLostBtn');
  const foundBtn = document.querySelector('#submitFoundBtn');

  // Naming your event handlers explicitly removes the "(anonymous)" tag from the stack!
  if (lostBtn) {
    lostBtn.addEventListener('click', function submitLostForm(e) {
      e.preventDefault();
      handleReportSubmission('lost');
    });
  }

  if (foundBtn) {
    foundBtn.addEventListener('click', function submitFoundForm(e) {
      e.preventDefault();
      handleReportSubmission('found');
    });
  }
});