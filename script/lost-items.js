// Local cache array to store the fetched items payload
let lostItemsCache = [];
const API_URL = "https://ooulostandfoundportal.onrender.com";

// ===================================================
// AUTH TOKEN
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

        // Save items to local cache for search processing
        lostItemsCache = itemsList;
        
        // Initial render execution
        renderFilteredItems();

    } catch (error) {
        console.error(error);
        container.innerHTML =
            `<p style="color:red;text-align:center;width:100%;">
                Unable to connect to server.
            </p>`;
    }
}

// 

// ===================================================
// RENDER ENGINE WITH FILTERING LOGIC
// ===================================================
function renderFilteredItems() {
    const container = document.querySelector("#lostItemsContainer");
    if (!container) return;

    // 1. Check if the initial database payload is completely empty
    if (lostItemsCache.length === 0) {
        container.innerHTML =
            `<p style="text-align:center;color:gray;width:100%;padding:20px;">
                No available items found.
            </p>`;
        return;
    }

    // Grab inputs safely
    const searchInput = document.getElementById('dashboardSearch') || document.querySelector('.search-top input[type="search"]');
    const statusSelect = document.getElementById('dashboardStatusFilter') || document.querySelector('.search-top select');
    const categorySelect = document.getElementById('dashboardCategoryFilter');

    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Normalize selected status value (forces lowercase and trims spaces)
    const selectedStatus = statusSelect ? statusSelect.value.toLowerCase().trim() : '';

    // Resolve Category Filters (Supports BOTH Checkboxes OR standard Dropdown options)
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

    // Retrieve locally saved proof-submitted items array
    const submittedClaims = JSON.parse(localStorage.getItem("submittedClaims") || "[]");

    // Apply filters
    const filtered = lostItemsCache.filter(item => {
        const itemName = (item.name || '').toLowerCase();
        const itemLocation = (item.foundLocation || '').toLowerCase();
        const itemCategory = (item.category || '').toLowerCase();
        const itemDate = (item.foundDate || item.createdAt || '').toLowerCase();
        
        // Normalize database status, defaulting to "available" if it is empty/undefined
        const itemStatus = (item.status || 'available').toLowerCase().trim();

        // Search text matching
        const matchesSearch = itemName.includes(searchQuery) || 
                              itemLocation.includes(searchQuery) || 
                              itemCategory.includes(searchQuery) ||
                              itemDate.includes(searchQuery);
        
        // Status matching (Handles "all", empty selection, or explicit matches like "available" / "claimed")
        const matchesStatus = !selectedStatus || 
                              selectedStatus === 'all' || 
                              itemStatus === selectedStatus;

        // Category matching (shows all elements if no conditions are checked)
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(itemCategory);

        return matchesSearch && matchesStatus && matchesCategory;
    });

    container.innerHTML = "";

    // 2. Check if items exist but were hidden by search filters
    if (filtered.length === 0) {
        container.innerHTML =
            `<p style="text-align:center;color:gray;width:100%;padding:20px;">
                No items match your search criteria.
            </p>`;
        return;
    }

    // Build the gallery view cards mapping matches
    filtered.forEach((item, index) => {
        const founder = item.founder
        const itemImg = item.imgUrl || "../images/Laptop.png";
        const itemName = item.name;
        const finderId = founder.name;
        const status = item.status;
        const idString = item._id;

        // Check if proof has already been submitted for this item
        const isClaimed = submittedClaims.includes(idString);

        const card = document.createElement("div");
        card.className = "items-box-item";

        card.innerHTML = `
            <div class="items-details">
                <div class="item-img">
                    <img src="${itemImg}" alt="${itemName}">
                    <p class="status ${status.toLowerCase()}">${status}</p>
                </div>

                <h2>${itemName}</h2>
                <span style="font-size: 0.8rem; color: gray; font-family: monospace;">Founder: ${finderId.substring(0, 10)}...</span>
            </div>

            <button
                onclick="viewItemDetails('${idString}')"
                class="open-btn">
                View Details
            </button>

            <button
                class="view-btn"
                data-item-id="${idString}"
                onclick="openRequestModal('${idString}')"
                ${isClaimed ? 'disabled style="background:#ccc;cursor:not-allowed;"' : ''}>
                <i class="fa-solid ${isClaimed ? 'fa-lock' : 'fa-check'}"></i>
                ${isClaimed ? 'Requested' : 'Request'}
            </button>
        `;

        container.appendChild(card);
    });
}

// ===================================================
// VIEW DETAILS (MATCHED WITH YOUR API PROPERTIES)
// ===================================================
function viewItemDetails(identifier) {
    const item = lostItemsCache.find(
        (u, index) => u._id === identifier || index.toString() === identifier
    );

    if (!item) return;

    const bottomSheet = document.getElementById("bottomSheet");
    const overlay = document.getElementById("overlay");
    if (!bottomSheet || !overlay) return;

    const itemImg = item.imgUrl || "../images/Laptop.png";
    const itemName = item.name;
    const itemCategory = item.category || "General";
    const itemLocation = item.foundLocation || "Unknown Location";
    const itemDate = item.foundDate || item.createdAt;
    const itemStatus = item.status;
    const itemDescription = item.description || "No description provided.";
    
    const reporter = item.founder.name;

    const formattedDate = itemDate !== "N/A" 
        ? new Date(itemDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) 
        : "N/A";

    let statusBg = "#0056b3"; 
    if (itemStatus.toLowerCase() === 'claimed') statusBg = "#ff8c00";
    if (itemStatus.toLowerCase() === 'approved') statusBg = "#28a745";
    if (itemStatus.toLowerCase() === 'rejected') statusBg = "#dc3545";

    bottomSheet.innerHTML = `
        <div style="padding: 24px;">
            <div class="sheet-header" style="margin-bottom: 20px; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                <h2 style="margin: 0; font-size: 1.4rem; color: purple;">Item Specifications</h2>
                <span class="close-btn" onclick="closeSheet()">&times;</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr; gap: 20px; max-height: 65vh; overflow-y: auto; padding-right: 4px;">
                
                <div style="position: relative; width: 100%; height: 200px; border-radius: 12px; overflow: hidden; background: #fafafa; display: flex; align-items: center; justify-content: center; border: 1px solid #eaeaea;">
                    <img src="${itemImg}" alt="${itemName}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    <span style="position: absolute; top: 12px; right: 12px; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: ${statusBg}; color: #ffffff;">
                        ${itemStatus}
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
                        <div><strong>Founder :</strong> <span style="font-family: monospace; background: #eaeaea; padding: 2px 6px; border-radius: 4px; word-break: break-all;">${reporter}</span></div>
                        <div><strong>Logged Item Name:</strong> <span>${itemName}</span></div>
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

// ===================================================
// CLAIM MODAL
// ===================================================
window.openRequestModal = function (itemId) {
    document.getElementById("modalItemId").value = itemId;
    document.getElementById("proofModal").style.display = "block";
};

window.closeModal = function () {
    document.getElementById("proofModal").style.display = "none";
    document.getElementById("proofForm").reset();
};

// ===================================================
// SUBMIT CLAIM (WITH AUTOMATIC REDIRECT)
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
    const placeholderFile = "https://placehold.co/600x400?text=No+Image+Provided";
    
    const submitBtn = document.querySelector("#proofForm button[type='submit']");
    const itemId = modalItemIdInput.value;

    const matchedItem = lostItemsCache.find(item => item._id === itemId);
    const actualItemName = matchedItem ? (matchedItem.name || matchedItem.itemName) : "Unknown Item";

    let actualClaimerName = "Registered User";
    if (localStorage.getItem("cuser")) {
        const parsedUser = JSON.parse(localStorage.getItem("cuser"));
        actualClaimerName = parsedUser.name || parsedUser.username || parsedUser.fullName || "Registered User";
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        const response = await fetch(`${API_URL}/user/claim-item`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                itemId: itemId,
                itemName: actualItemName,      
                claimerName: actualClaimerName, 
                description: descriptionInput.value,
                file: placeholderFile, 
                additional: additionalInput.value
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Submission failed.");
        }

        alert(result.message || "Proof submitted successfully!");
        
        const submittedClaims = JSON.parse(localStorage.getItem("submittedClaims") || "[]");
        if (!submittedClaims.includes(itemId)) {
            submittedClaims.push(itemId);
            localStorage.setItem("submittedClaims", JSON.stringify(submittedClaims));
        }

        closeModal();
        window.location.href = "./my-claims.html";

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
    const statusSelect = document.getElementById('dashboardStatusFilter') || document.querySelector('.search-top select');
    const categorySelect = document.getElementById('dashboardCategoryFilter');
    const searchBtn = document.getElementById('dashboardSearchBtn') || document.querySelector('.search-top button');

    if (searchInput) {
        searchInput.addEventListener("input", renderFilteredItems);
    }
    if (statusSelect) {
        statusSelect.addEventListener("change", renderFilteredItems);
    }
    if (categorySelect) {
        categorySelect.addEventListener("change", renderFilteredItems);
    }
    if (searchBtn) {
        searchBtn.addEventListener("click", renderFilteredItems);
    }

    // Capture dynamic checkbox selection changes cleanly
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
