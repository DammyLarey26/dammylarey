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
  const tabContainer = lostTabBtn?.parentElement;
  if (tabContainer && !document.querySelector('#claimsTabBtn')) {
    const claimsBtn = document.createElement('button');
    claimsBtn.id = 'claimsTabBtn';
    claimsBtn.className = 'tab-btn';
    claimsBtn.innerText = 'My Claims';
    claimsBtn.style.marginLeft = '10px'; // Matching your horizontal flow spacing
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

// --- HELPER: ROBUST USER EXTRACTOR ---
function getLoggedUserData() {
  const keys = ['user', 'cuser', 'userData'];
  for (const key of keys) {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const userObj = parsed.user || parsed.data || parsed;
        if (userObj) return userObj;
      } catch (e) {}
    }
  }
  return null;
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

  const loggedUser = getLoggedUserData();
  if (!loggedUser) {
    container.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px; font-weight: 500;">User profile missing. Please log in again.</p>`;
    return;
  }

  // Extract all identifiers to match against
  const myId = String(loggedUser._id || loggedUser.id || '').trim();
  const myEmail = String(loggedUser.email || '').toLowerCase().trim();
  
  try {
    container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 20px;">Loading history records...</p>`;

    // 1. FETCH ALL REPORTED ITEMS
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
      
      // 🌟 DIAGNOSTIC LOGGER: Inspect structure in DevTools
      console.log("Logged User Identity Details:", { myId, myEmail });
      console.log("Raw Server Items Example:", allItems[0]);

      // FILTER FOR REPORTED ITEMS
      reportedItemsList = allItems.filter(item => {
        if (!item) return false;

        // Collect all properties the backend might be using to reference ownership
        const propertiesToTest = [
          item.founder, 
          item.userId, 
          item.reporterId, 
          item.user, 
          item.reportedBy, 
          item.createdBy
        ];

        return propertiesToTest.some(prop => {
          if (!prop) return false;

          // If the property value is an object (populated query response)
          if (typeof prop === 'object') {
            const propId = String(prop._id || prop.id || '').trim();
            const propEmail = String(prop.email || '').toLowerCase().trim();
            return (myId && propId === myId) || (myEmail && propEmail === myEmail);
          }

          // Plain string comparisons
          const stringVal = String(prop).trim();
          return (myId && stringVal === myId) || (myEmail && stringVal.toLowerCase() === myEmail);
        });
      });
    }

    // 2. FETCH SUBMITTED CLAIM REQUESTS
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
        
        claimedItemsList = allClaims.filter(claim => {
          if (!claim) return false;
          const userField = claim.userId || claim.user || claim.claimer;
          
          if (typeof userField === 'object' && userField !== null) {
            const fieldId = String(userField._id || userField.id || '').trim();
            const fieldEmail = String(userField.email || '').toLowerCase().trim();
            return (myId && fieldId === myId) || (myEmail && fieldEmail === myEmail);
          }
          
          const val = String(userField || '').trim();
          return (myId && val === myId) || (myEmail && val.toLowerCase() === myEmail);
        });
      }
    } catch (claimErr) {
      console.error("Could not populate claim history metrics:", claimErr);
    }

    renderFilteredHistory();

  } catch (error) {
    console.error("Network Fetch Collection Error:", error);
    container.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">Network transmission failed. Could not pull data feed.</p>`;
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

      const itemNameStr = (claim.itemName || claim.name || '').toLowerCase();
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
      
      let badgeClass = 'claimed'; 
      if (cleanStatus === 'approved' || cleanStatus === 'verified' || cleanStatus === 'success') badgeClass = 'approved';
      if (cleanStatus === 'rejected' || cleanStatus === 'denied' || cleanStatus === 'failed') badgeClass = 'rejected';
      if (cleanStatus === 'available') badgeClass = 'available';

      return `
        <div class="history-card" style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin-bottom: 12px; background: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <div class="card-details">
            <span class="status ${badgeClass}">
              Claim: ${rawStatus}
            </span>
            <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 18px; margin-top: 6px;">${claim.itemName || claim.name || "Claimed Item"}</h3>
            <p style="margin: 3px 0; font-size: 14px; color: #64748b;"><strong>📝 Submitted Proof:</strong> ${claim.description || 'No description provided'}</p>
            <p style="margin: 3px 0; font-size: 14px; color: #64748b;"><strong>ℹ️ Additional Info:</strong> ${claim.additional || claim.additionalInfo || "None Provided"}</p>
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

  // --- LOGIC ROUTE B: RENDER REPORTED ITEMS ---
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
    const itemLocStr = (item.foundLocation || item.location || '').toLowerCase();
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
      <div class="history-card" style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin-bottom: 12px; background: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <div class="card-details">
          <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 18px;">${item.name}</h3>
          <p style="margin: 3px 0; font-size: 14px; color: #64748b;"><strong>📍 Location:</strong> ${item.foundLocation || item.location || "Not Specified"}</p>
          <p style="margin: 3px 0; font-size: 14px; color: #64748b;"><strong>📅 Date Logged:</strong> ${item.foundDate || item.createdAt ? (item.foundDate || item.createdAt).split('T')[0] : 'N/A'}</p>
          <p class="item-description" style="margin: 6px 0 0 0; font-size: 13px; color: #475569; font-style: italic;">"${item.description || 'No description provided'}"</p>
        </div>
        <div class="card-actions">
          <span class="status ${badgeClass}">
            ${rawStatus}
          </span>
        </div>
      </div>
    `;
  }).join('');
}