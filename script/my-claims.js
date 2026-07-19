// Local cache array to store the fetched user claims data
let userClaimsCache = [];
const API_URL = "https://ooulostandfoundportal.onrender.com";
// const API_URL = "http://localhost:5030";

// ===================================================
// AUTH TOKEN EXTRACTION
// ===================================================
function getSessionToken() {
    let token = localStorage.getItem("token");
    if (!token && localStorage.getItem("cuser")) {
        const parsedUser = JSON.parse(localStorage.getItem("cuser"));
        token = parsedUser.token || parsedUser.accessToken;
    }
    return token;
}

// ===================================================
// FETCH PERSONAL USER CLAIMS
// ===================================================
async function fetchUserClaims() {
    const container = document.querySelector("#claimsGridContainer");
    const token = getSessionToken();

    if (!token) {
        container.innerHTML = `
            <p style="color:red; text-align:center; width:100%; grid-column: 1/-1; padding: 40px 0;">
                Authentication required. Please log in to view your claims.
            </p>`;
        return;
    }

    try {
        container.innerHTML = `
            <p style="text-align:center; color:gray; width:100%; grid-column: 1/-1; padding: 40px 0;">
                Loading your submitted claims log...
            </p>`;
        
        const response = await fetch(`${API_URL}/user/my_claims`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        // Standardize different possible payload structural layouts safely
        const claimsList = result.items || result.request;

        if (!Array.isArray(claimsList)) {
            container.innerHTML = `
                <p style="color:orange; text-align:center; width:100%; grid-column: 1/-1;">
                    Server returned an incompatible data structural layout.
                </p>`;
            return;
        }

        // Cache original query array data
        userClaimsCache = claimsList;
        
        // Render statistics panels and grid cards
        calculateAndSetStats(userClaimsCache, result.stats);
        renderClaimsEngine();

    } catch (error) {
        console.error("Claims Request Failure:", error);
        container.innerHTML = `
            <p style="color:red; text-align:center; width:100%; grid-column: 1/-1; padding: 40px 0;">
                Unable to retrieve personal claims array from backend server.
            </p>`;
    }
}

// ===================================================
// DYNAMIC LIVE STATS ENGINE
// ===================================================
function calculateAndSetStats(claimsArray, stats) {
    // Standard fallbacks if stats object isn't directly calculated by backend
    const total = stats ? stats.total : claimsArray.length;
    const approved = stats ? stats.approved : claimsArray.filter(c => c.status === 'approved').length;
    const rejected = stats ? (stats.declined || stats.rejected) : claimsArray.filter(c => c.status === 'declined' || c.status === 'rejected').length;
    const pending = stats ? stats.pending : claimsArray.filter(c => c.status === 'pending').length;

    if(document.getElementById("totalClaimsCount")) document.getElementById("totalClaimsCount").textContent = total;
    if(document.getElementById("pendingClaimsCount")) document.getElementById("pendingClaimsCount").textContent = pending;
    if(document.getElementById("approvedClaimsCount")) document.getElementById("approvedClaimsCount").textContent = approved;
    if(document.getElementById("rejectedClaimsCount")) document.getElementById("rejectedClaimsCount").textContent = rejected;
}

// ===================================================
// DYNAMIC CARD FILTER AND LIST RENDERER 
// ===================================================
function renderClaimsEngine() {
    const container = document.getElementById("claimsGridContainer");
    const emptyState = document.getElementById("emptyClaimsState");
    if (!container) return;

    const searchInput = document.getElementById("claimsSearchInput");
    const statusSelect = document.getElementById("claimsStatusFilter");

    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedStatus = statusSelect ? statusSelect.value.toLowerCase() : 'all';

    // Processing criteria calculations locally
    const filteredClaims = userClaimsCache.filter(claim => {
        // Resolve target source (either nested object like claim.itemId / claim.item OR the flat object itself)
        const targetItem = claim.itemId || claim.item || claim;

        const itemName = (targetItem.itemName || targetItem.name || '').toLowerCase();
        const itemLocation = (targetItem.locationFound || targetItem.foundLocation || targetItem.location || '').toLowerCase();
        
        // Map backend state 'declined' to 'rejected' filtering logic seamlessly
        let claimStatus = (claim.status || 'pending').toLowerCase();
        if (claimStatus === 'declined') claimStatus = 'rejected';

        const matchesSearch = itemName.includes(searchQuery) || itemLocation.includes(searchQuery);
        const matchesStatus = (selectedStatus === 'all') || (claimStatus === selectedStatus);

        return matchesSearch && matchesStatus;
    });

    // Reset container view layout tracking mapping loops
    container.innerHTML = "";

    if (filteredClaims.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
    } else {
        if (emptyState) emptyState.style.display = "none";
    }

    filteredClaims.forEach(claim => {
        // Safe extraction target mapping (check nested payload item objects first)
        const targetItem = claim.itemId || claim.item || claim;

        // Fallbacks for data structures
        const itemImg = targetItem.imgUrl || targetItem.file || targetItem.imageUrl || "https://placehold.co/500x350?text=No+Image+Provided";
        const itemName = targetItem.itemName || targetItem.name || "Unnamed Item";
        const itemLocation = targetItem.locationFound || targetItem.foundLocation || targetItem.location || "Not Specified";
        
        // Formatting status badges accurately (declined mapped into rejected class names)
        const rawStatus = (claim.status || 'Pending').toLowerCase();
        let displayStatusText = "Pending Verification";
        let badgeClass = rawStatus;

        if (rawStatus === 'approved') {
            displayStatusText = "Approved";
        } else if (rawStatus === 'declined' || rawStatus === 'rejected') {
            displayStatusText = "Rejected";
            badgeClass = "rejected"; // Apply uniform CSS styling for custom rejection templates
        }

        // Date calculation fallbacks
        const dateFoundRaw = targetItem.foundDate || targetItem.dateFound || targetItem.createdAt || new Date();
        const dateClaimedRaw = claim.createdAt || claim.updatedAt || new Date();

        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedFoundDate = new Date(dateFoundRaw).toLocaleDateString('en-US', options);
        const formattedClaimedDate = new Date(dateClaimedRaw).toLocaleDateString('en-US', options);

        // Dynamic functional UI actions component rendering variables
        let actionButtons = `
            <button class="view" onclick="alert('Viewing specifications for item ID: ${claim._id || targetItem._id}')">
                View Details
            </button>
        `;

        // Check if item is approved and contains a dynamic root level WhatsApp link
        if (rawStatus === "approved" && claim.link) {
            actionButtons += `
                <a href="${claim.link}" target="_blank" class="contact-btn">
                    <i class="fab fa-whatsapp"></i> Finder
                </a>
            `;
        }

        const card = document.createElement("div");
        card.className = `claim-card status-${badgeClass}`;

        card.innerHTML = `
            <img src="${itemImg}" alt="${itemName}">
            <div class="content">
                <h3>${itemName}</h3>
                <span class="badge ${badgeClass}">${displayStatusText}</span>
                
                <p>
                    <i class="fa-solid fa-location-dot"></i>
                    ${itemLocation}
                </p>
                <p>
                    <i class="fa-solid fa-calendar"></i>
                    Found: ${formattedFoundDate}
                </p>
                <p>
                    <i class="fa-solid fa-paper-plane"></i>
                    Claimed: ${formattedClaimedDate}
                </p>
                <div class="buttons">
                    ${actionButtons}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ===================================================
// EVENT LISTENERS MOUNT 
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
    fetchUserClaims();

    const searchInput = document.getElementById("claimsSearchInput");
    const statusSelect = document.getElementById("claimsStatusFilter");

    if (searchInput) searchInput.addEventListener("input", renderClaimsEngine);
    if (statusSelect) statusSelect.addEventListener("change", renderClaimsEngine);
});