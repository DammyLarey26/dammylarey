// --- API DEFINITION (Aligned with report.js & postman.html) ---
const API_KEY = "https://ooulostandfoundportal.onrender.com";
// const API_KEY = "http://localhost:5030"; 

// Global cache tracking downloaded database items
let reportedItemsList = [];
let currentTypeFilter = 'lost'; // default tab selection matching layout configuration

document.addEventListener('DOMContentLoaded', () => {
  // Target HTML DOM Elements precisely
  const lostTabBtn = document.querySelector('#lostTabBtn');
  const foundTabBtn = document.querySelector('#foundTabBtn');
  const searchBar = document.querySelector('#searchBar');
  const statusFilter = document.querySelector('#statusFilter');

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

// --- FETCH METHOD CONTROLLER ---
async function fetchUserHistory() {
  const container = document.querySelector('#historyCardsContainer');
  if (!container) return;

  // 🔑 Extract authentication session token
  let token = localStorage.getItem('token');
  if (!token && localStorage.getItem('cuser')) {
    const parsedUser = JSON.parse(localStorage.getItem('cuser'));
    token = parsedUser.token || parsedUser.accessToken; 
  }

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

  const targetEndpoint = `${API_KEY}/user/lost-items`;
  console.log(`Fetching history logs from: ${targetEndpoint}`);

  try {
    container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 20px;">Loading your reported items...</p>`;

    const response = await fetch(targetEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok || data.success) {
      const allItems = data.data || data.items || [];
      
      // 🎯 CRITICAL FILTER: Keep ONLY items where the item's founder matches this specific user's ID
      reportedItemsList = allItems.filter(item => item.founder === currentUserId);
      
      renderFilteredHistory();
    } else {
      container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 20px;">${data.message || "No items reported yet."}</p>`;
    }

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

  if (type === 'lost') {
    lostTabBtn.classList.add('active');
    foundTabBtn.classList.remove('active');
  } else {
    foundTabBtn.classList.add('active');
    lostTabBtn.classList.remove('active');
  }

  renderFilteredHistory();
}

// --- RENDER ENGINE & SEARCH MAPPING ---
function renderFilteredHistory() {
  const container = document.querySelector('#historyCardsContainer');
  const searchQuery = document.querySelector('#searchBar')?.value.toLowerCase() || '';
  const selectedStatus = document.querySelector('#statusFilter')?.value || 'all';

  if (!container) return;

  // If the filtered array is completely empty, it means this user hasn't made any reports yet
  if (reportedItemsList.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #64748b; width: 100%;">
        <i class="fa-solid fa-folder-open" style="font-size: 40px; color: #cbd5e1; margin-bottom: 12px;"></i>
        <p style="font-weight: 600; font-size: 16px; margin: 0;">No items reported</p>
        <p style="font-size: 14px; color: #94a3b8; margin: 4px 0 0 0;">Any items you report as lost or found will appear here.</p>
      </div>`;
    return;
  }

  // Filter items matching tab and dashboard search metrics
  const filtered = reportedItemsList.filter(item => {
    // 1. Check item categorizing type ('lost' vs 'found')
    const matchesType = (item.type || 'lost').toLowerCase() === currentTypeFilter;

    // 2. Filter Status options mapping
    const itemStatus = (item.status || 'pending').toLowerCase();
    const matchesStatus = selectedStatus === 'all' || itemStatus === selectedStatus;

    // 3. Match user live text searches strings
    const itemNameStr = (item.name || '').toLowerCase();
    const itemDescStr = (item.description || '').toLowerCase();
    const itemLocStr = (item.foundLocation || '').toLowerCase();
    const matchesSearch = itemNameStr.includes(searchQuery) || 
                          itemDescStr.includes(searchQuery) || 
                          itemLocStr.includes(searchQuery);

    return matchesType && matchesStatus && matchesSearch;
  });

  // Fallback if they have items, but none match the current active search filter keyword
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #64748b; width: 100%;">
        <p style="font-weight: 600; font-size: 15px;">No items match your search criteria.</p>
      </div>`;
    return;
  }

  // Inject cards HTML mapping layout parameters cleanly 
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

  let token = localStorage.getItem('token');
  if (!token && localStorage.getItem('cuser')) {
    const parsedUser = JSON.parse(localStorage.getItem('cuser'));
    token = parsedUser.token || parsedUser.accessToken; 
  }

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