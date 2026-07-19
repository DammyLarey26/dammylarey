// Local cache array to store the fetched items payload
let lostItemsCache = [];
const API_URL = "https://ooulostandfoundportal.onrender.com";

// ===================================================
// AUTH TOKEN & USER ID EXTRACTION
// ===================================================
function getSessionToken() {
    let token = localStorage.getItem("token");

    if (!token && localStorage.getItem("cuser")) {
        const parsedUser = JSON.parse(localStorage.getItem("cuser"));
        token = parsedUser.token || parsedUser.accessToken;
    }

    return token;
}

function getCurrentUserId() {
    const cachedUser = localStorage.getItem('user') || localStorage.getItem('cuser');
    if (cachedUser) {
        try {
            const parsedData = JSON.parse(cachedUser);
            const userProfile = parsedData.user || parsedData;
            return userProfile._id || userProfile.id || userProfile.userId || null;
        } catch (e) {
            console.error("Error reading profile data from storage:", e);
        }
    }
    return null;
}

// ===================================================
// FETCH LOST ITEMS
// ===================================================
async function fetchAndDisplayLostItems() {
    const container = document.querySelector("#lostItemsContainer");
    const token = getSessionToken();

    if (!token) {
        container.innerHTML =
            `<p style="color:red;text-align:center;width:100%;">
                Authentication required. Please log in.
            </p>`;
        return;
    }

    try {
        container.innerHTML = `<p style="text-align:center;color:gray;width:100%;">Loading available items...</p>`;
        
        const response = await fetch(`${API_URL}/user/lost-items`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        const itemsList = result.data || result.items || result;

        if (!Array.isArray(itemsList)) {
            container.innerHTML =
                `<p style="color:orange;text-align:center;width:100%;">
                    Invalid response from server.
                </p>`;
            return;
        }

        lostItemsCache = itemsList;
        renderFilteredItems();

    } catch (error) {
        console.error(error);
        container.innerHTML =
            `<p style="color:red;text-align:center;width:100%;">
                Unable to connect to server.
            </p>`;
    }
}

// ===================================================
// RENDER ENGINE WITH FILTERING LOGIC
// ===================================================
function renderFilteredItems() {
    const container = document.querySelector("#lostItemsContainer");
    if (!container) return;

    if (lostItemsCache.length === 0) {
        container.innerHTML =
            `<p style="text-align:center;color:gray;width:100%;padding:20px;">
                No available items found.
            </p>`;
        return;
    }

    const searchInput = document.getElementById('dashboardSearch') || document.querySelector('.search-top input[type="search"]');
    const categorySelect = document.getElementById('dashboardCategoryFilter');

    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let selectedCategories = [];
    const checkboxes = document.querySelectorAll('.category-checkbox');
    
    if (checkboxes.length > 0) {
        selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(cb => cb.value.toLowerCase().trim());
    } else if (categorySelect) {
        const dropdownValue = categorySelect.value.toLowerCase().trim();
        if (dropdownValue && dropdownValue !== 'all') {
            selectedCategories = [dropdownValue];
        }
    }

    const currentUserId = getCurrentUserId();
    const submittedClaims = JSON.parse(localStorage.getItem(`submittedClaims_${currentUserId}`) || "[]");

    // Filter down array
    const filtered = lostItemsCache.filter(item => {
        const itemStatus = (item.status || 'available').toLowerCase().trim();

        // 🌟 RULE 1: ONLY remove permanently if globally approved or claimed
        if (itemStatus === 'approved' || itemStatus === 'claimed') {
            return false;
        }

        // 🌟 RULE 2: HIDE from this specific user if their claim was rejected/declined
        if (Array.isArray(item.claims) && currentUserId) {
            const userHasDeclinedClaim = item.claims.some(claim => {
                const claimUser = claim.user || claim.userId || claim.claimerId;
                const claimUserId = typeof claimUser === 'object' ? claimUser._id : claimUser;
                const claimStatus = (claim.status || '').toLowerCase().trim();
                
                return String(claimUserId) === String(currentUserId) && 
                       (claimStatus === 'rejected' || claimStatus === 'declined');
            });

            if (userHasDeclinedClaim) {
                return false; 
            }
        }

        const itemName = (item.name || '').toLowerCase();
        const itemLocation = (item.foundLocation || '').toLowerCase();
        const itemCategory = (item.category || '').toLowerCase();
        const itemDate = (item.foundDate || item.createdAt || '').toLowerCase();

        const matchesSearch = itemName.includes(searchQuery) || 
                              itemLocation.includes(searchQuery) || 
                              itemCategory.includes(searchQuery) ||
                              itemDate.includes(searchQuery);

        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(itemCategory);

        return matchesSearch && matchesCategory;
    });

    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML =
            `<p style="text-align:center;color:gray;width:100%;padding:20px;">
                No available items match your search criteria.
            </p>`;
        return;
    }

    filtered.forEach((item) => {
        const itemImg = item.imgUrl || "../images/Laptop.png";
        const itemName = item.name || "Unnamed Item";
        const idString = item._id;
        const itemLocation = item.foundLocation || "Not Specified";
        const itemCategory = item.category || "General";
        
        const rawDate = item.foundDate || item.createdAt;
        const formattedDate = rawDate && rawDate !== "N/A" 
            ? new Date(rawDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) 
            : "Not Specified";

        let finderDisplayName = "Anonymous";
        if (item.reporterName) {
            finderDisplayName = item.reporterName;
        } else if (item.founder && typeof item.founder === 'object' && item.founder.name) {
            finderDisplayName = item.founder.name;
        } else if (typeof item.founder === 'string') {
            finderDisplayName = item.founder;
        }

        // Check backend database claims to see if this user has already requested it
        let backendRequested = false;
        if (Array.isArray(item.claims) && currentUserId) {
            backendRequested = item.claims.some(claim => {
                const claimUser = claim.user || claim.userId || claim.claimerId;
                const claimUserId = typeof claimUser === 'object' ? claimUser._id : claimUser;
                return String(claimUserId) === String(currentUserId);
            });
        }

        // 🌟 COMBINED CLAIMS STATE: Button shows "Requested" ONLY if this specific user has requested it
        const isClaimed = submittedClaims.includes(idString) || backendRequested;

        const card = document.createElement("div");
        card.className = "claim-card";

        card.innerHTML = `
            <img src="${itemImg}" alt="${itemName}">
            <div class="content">
                <h3>${itemName}</h3>
                <span class="badge ${isClaimed ? 'pending' : 'approved'}">${isClaimed ? 'Requested' : 'Available'}</span>
                
                <p><i class="fa-solid fa-location-dot"></i> ${itemLocation}</p>
                <p><i class="fa-solid fa-calendar-days"></i> Found: ${formattedDate}</p>
                <p><i class="fa-solid fa-user"></i> Founder: ${finderDisplayName}</p>
            </div>

            <div class="buttons">
                <button onclick="viewItemDetails('${idString}')" class="view">
                    View Details
                </button>
                <button 
                    class="contact" 
                    data-item-id="${idString}" 
                    onclick="openRequestModal('${idString}')"
                    ${isClaimed ? 'disabled style="background:#ccc;cursor:not-allowed;"' : ''}>
                    <i class="fa-solid ${isClaimed ? 'fa-lock' : 'fa-check'}"></i>
                    ${isClaimed ? 'Requested' : 'Request'}
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

// ===================================================
// VIEW DETAILS
// ===================================================
function viewItemDetails(identifier) {
    const item = lostItemsCache.find(u => u._id === identifier);
    if (!item) return;

    const bottomSheet = document.getElementById("bottomSheet");
    const overlay = document.getElementById("overlay");
    if (!bottomSheet || !overlay) return;

    const itemImg = item.imgUrl || "../images/Laptop.png";
    const itemName = item.name || "Unnamed Item";
    const itemCategory = item.category || "General";
    const itemLocation = item.foundLocation || "Unknown Location";
    const itemDate = item.foundDate || item.createdAt;
    const itemDescription = item.description || "No description provided.";
    
    let reporterName = item.reporterName || "Anonymous";
    let reporterContact = item.reporterPhone || item.reporterEmail || "Not Provided";

    const formattedDate = itemDate && itemDate !== "N/A" 
        ? new Date(itemDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) 
        : "N/A";

    bottomSheet.innerHTML = `
        <div style="padding: 24px;">
            <div class="sheet-header" style="margin-bottom: 20px; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                <h2 style="margin: 0; font-size: 1.4rem; color: purple;">Item Specifications</h2>
                <span class="close-btn" onclick="closeSheet()">&times;</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr; gap: 20px; max-height: 65vh; overflow-y: auto; padding-right: 4px;">
                
                <div style="position: relative; width: 100%; height: 200px; border-radius: 12px; overflow: hidden; background: #fafafa; display: flex; align-items: center; justify-content: center; border: 1px solid #eaeaea;">
                    <img src="${itemImg}" alt="${itemName}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    <span style="position: absolute; top: 12px; right: 12px; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: #28a745; color: #ffffff;">
                        Available
                    </span>
                </div>

                <h1 style="margin: 0; font-size: 1.6rem; font-weight: 700; color: #111;">${itemName}</h1>

                <div class="sheet-content-par">
                    <strong style="color: #555;">Category:</strong>
                    <span>${itemCategory}</span>
                </div>

                <div class="sheet-content-par">
                    <strong style="color: #555;">Found Location:</strong>
                    <span>${itemLocation}</span>
                </div>

                <div class="sheet-content-par">
                    <strong style="color: #555;">Date Found:</strong>
                    <span>${formattedDate}</span>
                </div>

                <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; margin-top: 10px;">
                    <strong style="display: block; color: purple; font-size: 0.95rem; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
                        <i class="fa-solid fa-user-tag"></i> Founder & Item Identity Reference
                    </strong>
                    <div style="display: grid; gap: 6px; font-size: 0.85rem; color: #4a5568;">
                        <div><strong>Founder Name:</strong> <span>${item.founder.name}</span></div>
                        <div><strong>Recovery Location:</strong> <span>${itemLocation}</span></div>
                    </div>
                </div>

                <div style="border-top: 1px dashed #e2e8f0; padding-top: 15px; margin-top: 5px;">
                    <strong style="display: block; color: #555; margin-bottom: 6px;">Description:</strong>
                    <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: #4a5568; background: #fdfbff; padding: 12px; border-radius: 8px; border-left: 4px solid purple; text-align: justify;">
                        ${itemDescription}
                    </p>
                </div>
            </div>
        </div>
    `;

    openSheet();
}

function openSheet() {
    const sheet = document.getElementById("bottomSheet");
    const overlay = document.getElementById("overlay");
    if (sheet) sheet.style.bottom = "0";
    if (overlay) overlay.style.display = "block";
}

function closeSheet() {
    const sheet = document.getElementById("bottomSheet");
    const overlay = document.getElementById("overlay");
    if (sheet) sheet.style.bottom = "-100%";
    if (overlay) overlay.style.display = "none";
}

window.openRequestModal = function (itemId) {
    document.getElementById("modalItemId").value = itemId;
    document.getElementById("proofModal").style.display = "block";
};

window.closeModal = function () {
    document.getElementById("proofModal").style.display = "none";
    document.getElementById("proofForm").reset();
};

// ===================================================
// SUBMIT CLAIM
// ===================================================
async function submitProof(e) {
    e.preventDefault();

    const token = getSessionToken();
    if (!token) {
        alert("Please login.");
        window.location = './login.html';
        return;
    }

    const modalItemIdInput = document.getElementById('modalItemId');
    const descriptionInput = document.getElementById('proofDescription');
    const additionalInput = document.getElementById('proofAdditional');
    
    const submitBtn = document.querySelector("#proofForm button[type='submit']");
    const itemId = modalItemIdInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const dataForm = {
        itemId,
        description: descriptionInput.value,
        additional: additionalInput.value,
        file: "https://placehold.co/600x400?text=No+Image+Provided"
    };

    try {
        const response = await fetch(`${API_URL}/user/claim-item`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataForm)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Submission failed.");
        }

        alert(result.message || "Proof submitted successfully!");
        
        const currentUserId = getCurrentUserId();
        const submittedClaims = JSON.parse(localStorage.getItem(`submittedClaims_${currentUserId}`) || "[]");
        if (!submittedClaims.includes(itemId)) {
            submittedClaims.push(itemId);
            localStorage.setItem(`submittedClaims_${currentUserId}`, JSON.stringify(submittedClaims));
        }

        closeModal();
        fetchAndDisplayLostItems(); 

    } catch (err) {
        console.error(err);
        alert(err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Proof";
    }
}

// ===================================================
// INITIALIZE & INPUT EVENT LISTENERS
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
    fetchAndDisplayLostItems();

    const searchInput = document.getElementById('dashboardSearch') || document.querySelector('.search-top input[type="search"]');
    const categorySelect = document.getElementById('dashboardCategoryFilter');

    if (searchInput) {
        searchInput.addEventListener("input", renderFilteredItems);
    }
    if (categorySelect) {
        categorySelect.addEventListener("change", renderFilteredItems);
    }

    document.addEventListener("change", (e) => {
        if (e.target && e.target.classList.contains("category-checkbox")) {
            renderFilteredItems();
        }
    });

    const form = document.getElementById("proofForm");
    if (form) {
        form.addEventListener("submit", submitProof);
    }
});