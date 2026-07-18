// --- API DEFINITION ---
const API_KEY = "https://ooulostandfoundportal.onrender.com";

// Global cache for downloaded items
let reportedItemsList = [];
let currentTypeFilter = 'lost'; // Options: 'lost', 'found'

document.addEventListener('DOMContentLoaded', () => {
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

// --- HELPER: GET TOKEN ---
function getSessionToken() {
  let token = localStorage.getItem('token');
  if (!token && localStorage.getItem('cuser')) {
    const parsedUser = JSON.parse(localStorage.getItem('cuser'));
    token = parsedUser.token || parsedUser.accessToken; 
  }
  return token;
}

// --- FETCH METHOD ---
async function fetchUserHistory() {
  const container = document.querySelector('#historyCardsContainer');
  if (!container) return;

  const token = getSessionToken();
  if (!token) {
    container.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">Session token missing. Please log in.</p>`;
    return;
  }

  try {
    container.innerHTML = `<p style="text-align: center; color: #64748b; padding: 20px;">Loading your reports...</p>`;

    // FETCHING DATA FROM CORRECT ENDPOINT (Verified with /user/ prefix)
    const response = await fetch(`${API_KEY}/my-report`, { 
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
    
    const data = await response.json();
    if (response.ok || data.success) {
      reportedItemsList = data.data || data.items || data || [];
    } else {
      throw new Error("Failed to fetch");
    }

    renderFilteredHistory();
  } catch (error) {
    console.error("Fetch Error:", error);
    container.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">Failed to load data. Please check your connection.</p>`;
  }
}

function switchTab(type) {
  currentTypeFilter = type;
  const lostTabBtn = document.querySelector('#lostTabBtn');
  const foundTabBtn = document.querySelector('#foundTabBtn');

  lostTabBtn?.classList.toggle('active', type === 'lost');
  foundTabBtn?.classList.toggle('active', type === 'found');

  renderFilteredHistory();
}

// --- RENDER ENGINE ---
function renderFilteredHistory() {
  const container = document.querySelector('#historyCardsContainer');
  const searchQuery = document.querySelector('#searchBar')?.value.toLowerCase() || '';
  const selectedStatus = document.querySelector('#statusFilter')?.value || 'all';

  if (!container) return;

  const filtered = reportedItemsList.filter(item => {
    const matchesType = (item.type || 'lost').toLowerCase() === currentTypeFilter;
    const matchesStatus = selectedStatus === 'all' || (item.status || 'pending').toLowerCase() === selectedStatus;
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery) || 
                          (item.description || '').toLowerCase().includes(searchQuery);

    return matchesType && matchesStatus && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: #64748b;">No items found.</div>`;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="history-card" style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin-bottom: 12px; background: white;">
      <h3 style="margin: 0 0 6px 0;">${item.name}</h3>
      <p style="margin: 3px 0; font-size: 14px;"><strong>📍 Location:</strong> ${item.foundLocation || item.location || "N/A"}</p>
      <p style="font-size: 13px; color: #475569;">"${item.description || 'No description'}"</p>
      <span class="status">${item.status || 'Pending'}</span>
    </div>
  `).join('');
}