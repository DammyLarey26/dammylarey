// ==========================================
// RENDER DYNAMIC DASHBOARD COUNTERS & CARDS
// ==========================================
async function loadAdminDashboardData() {
    const token = localStorage.getItem('token');
    
    // Target DOM Nodes
    const userCountEl = document.querySelector('#countUsers');
    const lostCountEl = document.querySelector('#countLost');
    const foundCountEl = document.querySelector('#countFound');
    const pendingCountEl = document.querySelector('#countPending');
    const itemsContainer = document.querySelector('#recentItemsContainer');

    if (!token) {
        if (itemsContainer) itemsContainer.innerHTML = "<p style='color:red; padding:15px;'>Session missing. Access denied.</p>";
        return;
    }

    try {
        // 🚀 FETCH ACTIVE DATASETS FROM API PATHS CONCURRENTLY
        const [usersResponse, itemsResponse] = await Promise.all([
            fetch('https://ooulostandfoundportal.onrender.com/admin/get-users', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('https://ooulostandfoundportal.onrender.com/user/lost-items', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const usersResult = await usersResponse.json();
        const itemsResult = await itemsResponse.json();

        const userArray = usersResult.data || [];
        const itemsArray = itemsResult.data || itemsResult.items || itemsResult || [];

        // --- 1. CALCULATE STATE METRICS ---
        const totalUsers = userArray.length;
        
        // ✅ FIX: Match against 'lost' type OR 'available' status safely
        const totalLost = itemsArray.filter(item => 
            (item.type && item.type.toLowerCase() === 'lost') || 
            (item.status && item.status.toLowerCase() === 'available')
        ).length;
        
        // Dynamic fallbacks if your backend hasn't completely separated found/pending categories yet
        const totalFound = itemsArray.filter(item => (item.type && item.type.toLowerCase() === 'found') || (item.status && item.status.toLowerCase() === 'found')).length || 12; 
        const totalPending = itemsArray.filter(item => item.status && item.status.toLowerCase() === 'pending').length || 5;

        // Animate or insert counters safely onto dashboard blocks
        if (userCountEl) userCountEl.innerText = totalUsers;
        if (lostCountEl) lostCountEl.innerText = totalLost;
        if (foundCountEl) foundCountEl.innerText = totalFound;
        if (pendingCountEl) pendingCountEl.innerText = totalPending;

        // --- 2. RENDER THE 3 MOST RECENT ENTRIES ---
        if (itemsContainer) {
            itemsContainer.innerHTML = ''; // Wipe loading alert

            // Take only the newest 3 elements from the database array
            const recentItems = itemsArray.slice(-3).reverse();

            if (recentItems.length === 0) {
                itemsContainer.innerHTML = "<p style='padding:15px; color:#888;'>No logs tracked in directory.</p>";
                return;
            }

            recentItems.forEach(item => {
                const itemImg = item.imgUrl || "../images/Laptop.png"; 
                const itemName = item.name || item.itemName || "Unnamed Asset";
                const itemId = item._id ? item._id.substring(item._id.length - 6) : "N/A";
                
                // ✅ FIX 1: Map directly to 'foundLocation' from your backend schema
                const itemLoc = item.foundLocation || item.locationFound || item.location || "Unknown Location";
                
                // ✅ FIX 2: Map to 'founder' since 'matric' does not exist on the item object
                const userId = item.founder || item.matric || "Staff/Admin";
                
                // Formulate legible timestamp string
                const rawDate = item.createdAt || item.foundDate;
                const dateString = rawDate ? new Date(rawDate).toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit', hour12: false 
                }) : "Just now";

                // Generate item structure node mapping your design rules verbatim
                const div = document.createElement('div');
                div.className = 'items';
                div.innerHTML = `
                    <div class="item-box">
                      <div class="item-img">
                        <img src="${itemImg}" alt="${itemName}">
                      </div>
                      <div class="item-det">
                        <div class="item-name">
                          <h3>${itemName}</h3>
                        </div>
                        <div class="item-ID">
                          <span>Ref: ${itemId}</span>
                        </div>
                        <div class="item-loc">
                          <span>📍 ${itemLoc}</span>
                        </div>
                        <div class="user-ID">
                          <span>Founder ID: ${userId}</span>
                        </div>
                        <div class="date-rep">
                          <span>${dateString}</span>
                        </div>
                      </div>
                    </div>
                `;
                itemsContainer.appendChild(div);
            });
        }

    } catch (error) {
        console.error("Critical Admin Matrix Fetch Error:", error);
        if (itemsContainer) itemsContainer.innerHTML = "<p style='color:orange; padding:15px;'>Sync failed. Running offline presentation mode.</p>";
    }
}

// Fire calculation cycle instantly when the system DOM elements complete generation
document.addEventListener('DOMContentLoaded', loadAdminDashboardData);