// --- API DEFINITION (Aligned with report.js & postman.html) ---
const API_KEY = "https://ooulostandfoundportal.onrender.com";
// const API_KEY = "http://localhost:5030"; 

// Global cache tracking downloaded database items
let reportedItemsList = [];
let claimedItemsList = []; // Cache tracking user's submitted claim requests
let currentTypeFilter = 'lost'; // Options: 'lost', 'found', or 'claims'

document.addEventListener('DOMContentLoaded', () => {
  // Target HTML DOM Elements precisely
  const lostTabBtn = document.querySelector('#lostTabBtn');
  const foundTabBtn = document.querySelector('#foundTabBtn');
  const searchBar = document.querySelector('#searchBar');
  const statusFilter = document.querySelector('#statusFilter');

  // --- DYNAMICALLY INJECT THE CLAIMS TOGGLE BUTTON ---
  const tabContainer = lostTabBtn?.parentElement;
  if (tabContainer && !document.querySelector('#claimsTabBtn')) {
    const claimsBtn = document.createElement('button');
    claimsBtn.id = 'claimsTabBtn';
    claimsBtn.className = 'tab-btn';
    claimsBtn.innerText = 'My Claims';
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
    container.innerHTML = `<p class="status-msg error">Session token missing. Please log in again.</p>`;
    return;
  }

  const cachedUser = localStorage.getItem('user') || localStorage.getItem('cuser');
  if (!cachedUser) {
    container.innerHTML = `<p class="status-msg error">User profile missing. Please log in again.</p>`;
    return;
  }
  
  const currentUser = JSON.parse(cachedUser);
  const currentUserId = String(currentUser._id || currentUser.id || "");

  try {
    container.innerHTML = `<p class="status-msg loading">Loading history records...</p>`;

    // 1. FETCH GLOBAL / USER ITEMS
    const itemsResponse = await fetch(`${API_KEY}/user/lost-items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const itemsData = await itemsResponse.json();
    if (itemsResponse.ok || itemsData.success) {
      const allItems = itemsData.data || itemsData.items || itemsData || [];
      
      // Captures items reported by the user OR items requested/claimed by the user
      reportedItemsList = allItems.filter(item => {
        const founderId = item.founder?._id || item.founder || item.userId?._id || item.userId || "";
        const requesterId = item.claimedBy?._id || item.claimedBy || "";
        
        return (String(founderId) === currentUserId || String(requesterId) === currentUserId) && currentUserId !== "";
      });
    }

    // 2. FETCH USER'S SUBMITTED CLAIM REQUEST DETAILS
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
        
        // Captures claims submitted by this specific user
        claimedItemsList = allClaims.filter(claim => {
          const claimerId = claim.userId?._id || claim.userId || claim.claimerId || "";
          return String(claimerId) === currentUserId || !claim.userId;
        });
      }
    } catch (claimErr) {
      console.error("Could not populate claim history metrics:", claimErr);
    }

    renderFilteredHistory();

  } catch (error) {
    console.error("Network Fetch Collection Error:", error);
    container.innerHTML = `<p class="status-msg error">Network transmission failed. Could not pull data feed.</p>`;
  }
}

function switchTab(type) {
  currentTypeFilter = type;
  
  const lostTabBtn = document.querySelector('#lostTabBtn');
  const foundTabBtn = document.querySelector('#foundTabBtn');
  const claimsTabBtn = document.querySelector('#claimsTabBtn');

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
        <div class="empty">
          <i class="fa-solid fa-clock"></i>
          <h2>No Claim Requests Made</h2>
          <p>Items you attempt to claim will appear here along with their status.</p>
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
      container.innerHTML = `<div class="empty"><p>No claim requests match your search criteria.</p></div>`;
      return;
    }

    container.innerHTML = filteredClaims.map(claim => {
      const rawStatus = claim.status || 'Pending';
      const cleanStatus = rawStatus.toLowerCase();
      
      let badgeClass = 'claimed'; 
      if (cleanStatus === 'approved' || cleanStatus === 'verified') badgeClass = 'approved';
      if (cleanStatus === 'rejected' || cleanStatus === 'denied') badgeClass = 'rejected';
      if (cleanStatus === 'available') badgeClass = 'available';

      return `
        <div class="history-card">
          <div class="card-details">
            <h3>${claim.itemName || "Claimed Item"}</h3>
            <p><strong>📝 Submitted Proof:</strong> ${claim.description}</p>
            <p><strong>ℹ️ Additional Info:</strong> ${claim.additional || "None Provided"}</p>
          </div>
          <span class="status ${badgeClass}">
            Claim: ${rawStatus}
          </span>
        </div>
      `;
    }).join('');
    return;
  }

  // --- LOGIC ROUTE B: RENDER REPORTED & REQUESTED ITEMS ---
  if (reportedItemsList.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <i class="fa-solid fa-folder-open"></i>
        <h2>No items reported</h2>
        <p>Any items you report as lost or found will appear here.</p>
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
      <div class="empty">
        <p>No items match your search criteria.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const rawStatus = item.status || 'Pending';
    const cleanStatus = rawStatus.toLowerCase();
    
    let badgeClass = 'claimed'; 
    if (cleanStatus === 'available') {
      badgeClass = 'available';
    } else if (cleanStatus === 'claimed' || cleanStatus === 'pending') {
      badgeClass = 'claimed';
    } else if (cleanStatus === 'approved' || cleanStatus === 'found') {
      badgeClass = 'approved';
    } else if (cleanStatus === 'rejected' || cleanStatus === 'closed') {
      badgeClass = 'rejected';
    }

    return `
      <div class="history-card">
        <div class="card-details">
          <h3>${item.name}</h3>
          <p><strong>📍 Location:</strong> ${item.foundLocation || "Not Specified"}</p>
          <p><strong>📅 Date Logged:</strong> ${item.foundDate ? item.foundDate.split('T')[0] : 'N/A'}</p>
          <p class="item-description">"${item.description}"</p>
        </div>
        <span class="status ${badgeClass}">
          ${rawStatus}
        </span>
      </div>
    `;
  }).join('');
}