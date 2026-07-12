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

  // 👤 User Profile Identifier Extraction
  const cachedUser = localStorage.getItem('user') || localStorage.getItem('cuser');
  let reporterId = null;
  if (cachedUser) {
    const parsedUser = JSON.parse(cachedUser);
    reporterId = parsedUser._id || parsedUser.id; 
  }

  // 📦 Build Unified Payload Layout
  const reportPayload = {
    name: itemName.value.trim(),
    description: itemDescription?.value || "No description provided.",
    imgUrl: "https://placehold.co/600x400?text=No+Image+Provided", 
    founder: reporterId,              
    foundLocation: itemLocation?.value || "Unknown Location", 
    foundDate: itemDate?.value || new Date().toISOString().split('T')[0], 
    category: itemCategory.value,
    type: reportType // ✨ Dynamically sets 'lost' or 'found'
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
      alert(`Item reported as ${reportType} successfully!`);
      window.location.href = './history.html'; // Redirect to tracking logs
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

  if (lostBtn) {
    lostBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleReportSubmission('lost');
    });
  }

  if (foundBtn) {
    foundBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleReportSubmission('found');
    });
  }
});