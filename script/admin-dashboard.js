async function loadAdminDashboardData() {
    // 🚀 BYPASS: Authentication deactivated for dashboard access
    const token = localStorage.getItem('token') || "GUEST_ACCESS_MODE"; 
    
    // Target DOM Nodes
    const userCountEl = document.querySelector('#countUsers');
    const lostCountEl = document.querySelector('#countLost');
    const foundCountEl = document.querySelector('#countFound');
    const pendingCountEl = document.querySelector('#countPending');
    const itemsContainer = document.querySelector('#recentItemsContainer');

    try {
        // We still send the token, but we no longer block the script if it's missing
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

        // --- 1. CORRECTED STATE METRICS ---
        if (userCountEl) userCountEl.innerText = userArray.length;
        
        if (lostCountEl) {
            lostCountEl.innerText = itemsArray.filter(item => 
                (item.type && item.type.toLowerCase() === 'lost') || 
                (item.status && item.status.toLowerCase() === 'available')
            ).length;
        }
        
        if (foundCountEl) {
            foundCountEl.innerText = itemsArray.filter(item => 
                (item.type && item.type.toLowerCase() === 'found') || 
                (item.status && item.status.toLowerCase() === 'found')
            ).length;
        }
        
        if (pendingCountEl) {
            pendingCountEl.innerText = itemsArray.filter(item => 
                item.status && item.status.toLowerCase() === 'pending'
            ).length;
        }

        // --- 2. CORRECTED RECENTLY UPDATED (CHRONOLOGICAL SORT) ---
        if (itemsContainer) {
            itemsContainer.innerHTML = ''; 

            // Sort by date newest to oldest
            const recentItems = itemsArray
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 3);

            if (recentItems.length === 0) {
                itemsContainer.innerHTML = "<p style='padding:15px; color:#888;'>No logs tracked in directory.</p>";
                return;
            }

            recentItems.forEach(item => {
                const itemImg = item.imgUrl || "../images/Laptop.png"; 
                const itemName = item.name || item.itemName || "Unnamed Asset";
                const itemId = item._id ? item._id.substring(item._id.length - 6) : "N/A";
                const itemLoc = item.foundLocation || item.locationFound || item.location || "Unknown Location";
                const userId = item.founder || item.matric || "Staff/Admin";
                
                const rawDate = item.createdAt || item.foundDate;
                const dateString = rawDate ? new Date(rawDate).toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit', hour12: false 
                }) : "Just now";

                const div = document.createElement('div');
                div.className = 'items';
                div.innerHTML = `
                    <div class="item-box">
                      <div class="item-img">
                        <img src="${itemImg}" alt="${itemName}">
                      </div>
                      <div class="item-det">
                        <div class="item-name"><h3>${itemName}</h3></div>
                        <div class="item-ID"><span>Ref: ${itemId}</span></div>
                        <div class="item-loc"><span>📍 ${itemLoc}</span></div>
                        <div class="user-ID"><span>Founder ID: ${userId}</span></div>
                        <div class="date-rep"><span>${dateString}</span></div>
                      </div>
                    </div>
                `;
                itemsContainer.appendChild(div);
            });
        }

    } catch (error) {
        console.error("Critical Admin Matrix Fetch Error:", error);
        if (itemsContainer) itemsContainer.innerHTML = "<p style='color:orange; padding:15px;'>Sync failed. Check your connection.</p>";
    }
}

document.addEventListener('DOMContentLoaded', loadAdminDashboardData);