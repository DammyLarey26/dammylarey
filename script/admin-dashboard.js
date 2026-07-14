async function loadAdminDashboardData() {
    // 1. Get the actual token. Fall back to guest mode only if absolutely necessary
    const token = localStorage.getItem('token') || "GUEST_ACCESS_MODE"; 
    
    // Target DOM Nodes
    const userCountEl = document.querySelector('#countUsers');
    const lostCountEl = document.querySelector('#countLost'); 
    const pendingCountEl = document.querySelector('#countPending');
    const itemsContainer = document.querySelector('#recentItemsContainer');

    const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // --- Helper function to fetch safely without crashing the dashboard ---
    async function safeFetch(url) {
        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                console.warn(`API Warning: ${url} returned status ${response.status}`);
                return null;
            }
            return await response.json();
        } catch (err) {
            console.error(`Network Error fetching ${url}:`, err);
            return null;
        }
    }

    // --- 2. FETCH DATA CONCURRENTLY (Using corrected claim-request route) ---
    const [usersResult, itemsResult, claimsResult] = await Promise.all([
        safeFetch('https://ooulostandfoundportal.onrender.com/admin/get-users'),
        safeFetch('https://ooulostandfoundportal.onrender.com/user/lost-items'),
        safeFetch('https://ooulostandfoundportal.onrender.com/admin/claim-request') // <-- Path Updated!
    ]);

    // --- 3. PROCESS & UPDATE METRICS ---

    // Update Users Count
    if (usersResult && userCountEl) {
        const userArray = usersResult.data || usersResult.users || usersResult || [];
        userCountEl.innerText = userArray.length;
    } else if (userCountEl) {
        userCountEl.innerText = "Error";
    }
    
    // Update Total Items Count
    let itemsArray = [];
    if (itemsResult) {
        itemsArray = itemsResult.data || itemsResult.items || itemsResult || [];
        if (lostCountEl) lostCountEl.innerText = itemsArray.length;
    } else if (lostCountEl) {
        lostCountEl.innerText = "Error";
    }
    
    // Update Pending Claims (Tolerates both standard array payloads and direct count fields)
    if (pendingCountEl) {
        if (claimsResult) {
            console.log("Claim Request Raw Response:", claimsResult); // Useful diagnostic log

            // Find the claims list in common response wrappers
            let claimsArray = [];
            if (Array.isArray(claimsResult)) {
                claimsArray = claimsResult;
            } else if (claimsResult.data && Array.isArray(claimsResult.data)) {
                claimsArray = claimsResult.data;
            } else if (claimsResult.claims && Array.isArray(claimsResult.claims)) {
                claimsArray = claimsResult.claims;
            } else if (claimsResult.claimRequests && Array.isArray(claimsResult.claimRequests)) {
                claimsArray = claimsResult.claimRequests;
            }

            // Fallback to checking direct counter properties if the backend returns statistics instead of lists
            const claimsCount = claimsResult.count ?? claimsResult.total ?? claimsResult.totalClaims;

            if (claimsArray.length > 0) {
                // Keep objects marked 'pending' (or include objects without status under the assumption they represent fresh pending requests)
                const pendingClaims = claimsArray.filter(claim => {
                    if (claim.status) {
                        return claim.status.toLowerCase() === 'pending';
                    }
                    return true; 
                });
                pendingCountEl.innerText = pendingClaims.length;
            } else if (typeof claimsCount === 'number') {
                pendingCountEl.innerText = claimsCount;
            } else {
                pendingCountEl.innerText = "0";
            }
        } else {
            pendingCountEl.innerText = "Error";
        }
    }

    // --- 4. RENDER RECENTLY UPDATED ITEMS ---
    if (itemsContainer) {
        if (!itemsResult || itemsArray.length === 0) {
            itemsContainer.innerHTML = "<p style='padding:15px; color:#888;'>No logs tracked in directory.</p>";
            return;
        }

        itemsContainer.innerHTML = ''; 

        // Sort items by creation date (newest to oldest)
        const recentItems = itemsArray
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 3);

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
}

// Fire data loader when DOM is ready
document.addEventListener('DOMContentLoaded', loadAdminDashboardData);