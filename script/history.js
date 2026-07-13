// --- API DEFINITION (Aligned with report.js & postman.html) ---
const API_KEY = "https://ooulostandfoundportal.onrender.com";
// const API_KEY = "http://localhost:5030"; 

// Global cache tracking downloaded database items
let reportedItemsList = [];
let claimedItemsList = []; // New cache tracking user's submitted claim requests
let currentTypeFilter = 'lost'; // Options: 'lost', 'found', or 'claims'

document.addEventListener('DOMContentLoaded', () => {
  // Target HTML DOM Elements precisely
  const lostTabBtn = document.querySelector('#lostTabBtn');
  const foundTabBtn = document.querySelector('#foundTabBtn');
  const searchBar = document.querySelector('#searchBar');
  const statusFilter = document.querySelector('#statusFilter');

  // --- DYNAMICALLY INJECT THE CLAIMS TOGGLE BUTTON ---
  // This automatically inserts the "My Claims" tab into your tab container if it doesn't exist in HTML
  const tabContainer = lostTabBtn?.parentElement;
  if (tabContainer && !document.querySelector('#claimsTabBtn')) {
    const claimsBtn = document.createElement('button');
    claimsBtn.id = 'claimsTabBtn';
    claimsBtn.className = 'tab-btn';
    claimsBtn.innerText = 'My Claims';
    claimsBtn.style.marginleft = '10px'; // Matching your horizontal flow spacing
    claimsBtn.addEventListener('click', () => switchTab('claims'));
    tabContainer.appendChild(claimsBtn);
  }

  // Initialize Tab Navigation Listeners
  if (lostTabBtn && foundTabBtn) {
    lostTabBtn.addEventListener('click', () => switchTab('lost'));
    foundTabBtn.addEventListener('click', () => switchTab('found'));
  }

  // Filter Input Action Listeners
  if (searchBar) searchBar.addEventListener('input', renderFilteredHistory);
  if (statusFilter) statusFilter.addEventListener('change', renderFilteredHistory);

  // Auto-load history records on screen load
  fetchUserHistory();
});

// --- HELPER: GET TOKEN EXTRACTOR ---
function getSessionToken() {
  let token = localStorage.getItem('token');
  if (!token && localStorage.getItem('cuser')) {
    const parsedUser = JSON.parse(localStorage.getItem('cuser'));
    token = parsedUser.token || parsedUser.accessToken; 
  }
  return token;
}

// --- FETCH METHOD CONTROLLER ---
async function fetchUserHistory() {
  const container = document.querySelector('#historyCardsContainer');
  if (!container) return;

  const token = getSessionToken();
  if (!token) {
    container.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px; font-weight: 500;">Session token missing. Please log in again.</p>`;
    return;
  }

  // 👤 Get the current logged-in user's data (Uses 'user' key matching postman.html)
  const cachedUser = localStorage.getItem('user') || localStorage.getItem('cuser');
  if (!cachedUser) {
    container.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px; font-weight: 500;">User profile missing. Please log in again.</p>`;
    return;
  }
  
  const currentUser = JSON.parse(cachedUser);
  const currentUserId = currentUser._id || currentUser.id; // Target user's unique MongoDB ID

  try {
    container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 20px;">Loading history records...</p>`;

    // 1. FETCH USER'S REPORTED ITEMS (LOST/FOUND)
    const itemsResponse = await fetch(`${API_KEY}/user/lost-items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const itemsData = await itemsResponse.json();
    if (itemsResponse.ok || itemsData.success) {
      const allItems = itemsData.data || itemsData.items || [];
      reportedItemsList = allItems.filter(item => item.founder === currentUserId);
    }

    // 2. FETCH USER'S SUBMITTED CLAIM REQUESTS
    // Reaches out to the verification endpoint to display items requested by this user
    try {
      const claimsResponse = await fetch(`${API_KEY}/admin/claim-request`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const claimsData = await claimsResponse.json();
      if (claimsResponse.ok) {
        const allClaims = claimsData.data || claimsData.claims || claimsData || [];
        // Optional filter if backend doesn't filter by user automatically:
        // claimedItemsList = allClaims.filter(c => c.userId === currentUserId || c.claimerName === (currentUser.name || currentUser.username));
        claimedItemsList = allClaims;
      }
    } catch (claimErr) {
      console.error("Could not populate claim history metrics:", claimErr);
    }

    // Direct data feed into visual compiler mapping active layout rules
    renderFilteredHistory();

  } catch (error) {
    console.error("Network Fetch Collection Error:", error);
    container.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">Network transmission failed. Could not pull data feed.</p>`;
  }
}

// Controls shifting active navigation style toggles
function switchTab(type) {
  currentTypeFilter = type;
  
  const lostTabBtn = document.querySelector('#lostTabBtn');
  const foundTabBtn = document.querySelector('#foundTabBtn');
  const claimsTabBtn = document.querySelector('#claimsTabBtn');

  // Clear states across elements 
  lostTabBtn?.classList.remove('active');
  foundTabBtn?.classList.remove('active');
  claimsTabBtn?.classList.remove('active');

  if (type === 'lost' && lostTabBtn) {
    lostTabBtn.classList.add('active');
  } else if (type === 'found' && foundTabBtn) {
    foundTabBtn.classList.add('active');
  } else if (type === 'claims' && claimsTabBtn) {
    claimsTabBtn.classList.add('active');
  }

  renderFilteredHistory();
}

// --- RENDER ENGINE & SEARCH MAPPING ---
function renderFilteredHistory() {
  const container = document.querySelector('#historyCardsContainer');
  const searchQuery = document.querySelector('#searchBar')?.value.toLowerCase() || '';
  const selectedStatus = document.querySelector('#statusFilter')?.value || 'all';

  if (!container) return;

  // --- LOGIC ROUTE A: RENDER SUBMITTED CLAIMS ---
  if (currentTypeFilter === 'claims') {
    if (claimedItemsList.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #64748b; width: 100%;">
          <i class="fa-solid fa-clock" style="font-size: 40px; color: #cbd5e1; margin-bottom: 12px;"></i>
          <p style="font-weight: 600; font-size: 16px; margin: 0;">No Claim Requests Made</p>
          <p style="font-size: 14px; color: #94a3b8; margin: 4px 0 0 0;">Items you attempt to claim will appear here along with their status.</p>
        </div>`;
      return;
    }

    const filteredClaims = claimedItemsList.filter(claim => {
      const rawStatus = (claim.status || 'pending').toLowerCase();
      const matchesStatus = selectedStatus === 'all' || rawStatus === selectedStatus;

      const itemNameStr = (claim.itemName || '').toLowerCase();
      const itemDescStr = (claim.description || '').toLowerCase();
      const matchesSearch = itemNameStr.includes(searchQuery) || itemDescStr.includes(searchQuery);

      return matchesStatus && matchesSearch;
    });

    if (filteredClaims.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 40px; color: #64748b; width: 100%;"><p style="font-weight: 600; font-size: 15px;">No claim requests match your search criteria.</p></div>`;
      return;
    }

    container.innerHTML = filteredClaims.map(claim => {
      const rawStatus = claim.status || 'Pending';
      const cleanStatus = rawStatus.toLowerCase();
      
      let badgeClass = 'status-pending'; // Yellow/Orange
      if (cleanStatus === 'approved' || cleanStatus === 'verified') badgeClass = 'status-found'; // Green
      if (cleanStatus === 'rejected' || cleanStatus === 'denied') badgeClass = 'status-closed'; // Red

      return `
        <div class="history-card" style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin-bottom: 12px; background: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <div class="card-details">
            <span class="status-badge ${badgeClass}" style="display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">
              Claim: ${rawStatus}
            </span>
            <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 18px;">${claim.itemName || "Claimed Item"}</h3>
            <p style="margin: 3px 0; font-size: 14px; color: #64748b;"><strong>📝 Submitted Proof:</strong> ${claim.description}</p>
            <p style="margin: 3px 0; font-size: 14px; color: #64748b;"><strong>ℹ️ Additional Info:</strong> ${claim.additional || "None Provided"}</p>
          </div>
          <div class="card-actions">
            <button style="background: #e2e8f0; border: none; color: #475569; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: not-allowed;" disabled>
              🔒 Locked
            </button>
          </div>
        </div>
      `;
    }).join('');
    return;
  }

  // --- LOGIC ROUTE B: RENDER REPORTED ITEMS (YOUR ORIGINAL CODE) ---
  if (reportedItemsList.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #64748b; width: 100%;">
        <i class="fa-solid fa-folder-open" style="font-size: 40px; color: #cbd5e1; margin-bottom: 12px;"></i>
        <p style="font-weight: 600; font-size: 16px; margin: 0;">No items reported</p>
        <p style="font-size: 14px; color: #94a3b8; margin: 4px 0 0 0;">Any items you report as lost or found will appear here.</p>
      </div>`;
    return;
  }

  const filtered = reportedItemsList.filter(item => {
    const matchesType = (item.type || 'lost').toLowerCase() === currentTypeFilter;
    const itemStatus = (item.status || 'pending').toLowerCase();
    const matchesStatus = selectedStatus === 'all' || itemStatus === selectedStatus;

    const itemNameStr = (item.name || '').toLowerCase();
    const itemDescStr = (item.description || '').toLowerCase();
    const itemLocStr = (item.foundLocation || '').toLowerCase();
    const matchesSearch = itemNameStr.includes(searchQuery) || 
                          itemDescStr.includes(searchQuery) || 
                          itemLocStr.includes(searchQuery);

    return matchesType && matchesStatus && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #64748b; width: 100%;">
        <p style="font-weight: 600; font-size: 15px;">No items match your search criteria.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const rawStatus = item.status || 'Pending';
    const cleanStatus = rawStatus.toLowerCase();
    
    let badgeClass = 'status-pending';
    if (cleanStatus === 'approved' || cleanStatus === 'found') badgeClass = 'status-found';
    if (cleanStatus === 'rejected' || cleanStatus === 'closed') badgeClass = 'status-closed';

    return `
      <div class="history-card" style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin-bottom: 12px; background: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <div class="card-details">
          <span class="status-badge ${badgeClass}" style="display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">
            ${rawStatus}
          </span>
          <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 18px;">${item.name}</h3>
          <p style="margin: 3px 0; font-size: 14px; color: #64748b;"><strong>📍 Location:</strong> ${item.foundLocation || "Not Specified"}</p>
          <p style="margin: 3px 0; font-size: 14px; color: #64748b;"><strong>📅 Date Logged:</strong> ${item.foundDate ? item.foundDate.split('T')[0] : 'N/A'}</p>
          <p class="item-description" style="margin: 6px 0 0 0; font-size: 13px; color: #475569; font-style: italic;">"${item.description}"</p>
        </div>
        <div class="card-actions">
          <button class="btn-delete" onclick="deleteHistoryItem('${item._id}')" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">
            🗑️ Delete Report
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// --- SELF-DELETION HANDLER ---
window.deleteHistoryItem = async (itemId) => {
  if (!confirm("Are you sure you want to permanently delete this item report?")) return;

  const token = getSessionToken();
  try {
    const response = await fetch(`${API_KEY}/user/items/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    if (response.ok || result.success) {
      alert("Report successfully deleted.");
      fetchUserHistory(); 
    } else {
      alert(result.message || "Failed to delete item from system records.");
    }
  } catch (err) {
    console.error("Deletion network error context:", err);
    alert("Network response timeout while executing delete transaction.");
  }
};