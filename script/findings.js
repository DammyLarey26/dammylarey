// Local cache array to store the fetched items payload
let lostItemsCache = [];
const API_URL = "https://ooulostandfoundportal.onrender.com";

// ===================================================
// FETCH LOST ITEMS (PUBLIC ROUTE ACCESS)
// ===================================================
async function fetchAndDisplayLostItems() {
    const container = document.querySelector("#lostItemsContainer");

    try {
        container.innerHTML = `<p style="text-align:center;color:gray;width:100%;">Loading available items...</p>`;
        
        // Fetching without standard Authorization headers so it's fully open
        const response = await fetch(`${API_URL}/user/lost-items`, {
            method: "GET",
            headers: {
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

// ===================================================
// RENDER ENGINE WITH FILTERING LOGIC
// ===================================================
function renderFilteredItems() {
    const container = document.querySelector("#lostItemsContainer");
    if (!container) return;

    // Grab live values from your HTML layout elements safely
    const searchInput = document.getElementById('dashboardSearch') || document.querySelector('.search-top input[type="search"]');
    const categorySelect = document.getElementById('dashboardCategoryFilter') || document.querySelector('.search-top select');

    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCategory = categorySelect ? categorySelect.value.toLowerCase() : '';

    // Apply conditional text & category selector filters
    const filtered = lostItemsCache.filter(item => {
        const itemName = (item.name || item.itemName || '').toLowerCase();
        const itemLocation = (item.locationFound || item.location || item.foundLocation || '').toLowerCase();
        const itemCategory = (item.category || '').toLowerCase();
        const itemDate = (item.dateFound || item.createdAt || '').toLowerCase();

        // 1. Text Search matching keywords across Title, Location, Category, and Date fields
        const matchesSearch = itemName.includes(searchQuery) || 
                              itemLocation.includes(searchQuery) || 
                              itemCategory.includes(searchQuery) ||
                              itemDate.includes(searchQuery);

        // 2. Dropdown Category layout parameter filter
        const matchesCategory = !selectedCategory || selectedCategory === 'all' || itemCategory === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML =
            `<p style="text-align:center;color:gray;width:100%;padding:20px;">
                No items match your search criteria.
            </p>`;
        return;
    }

    // Build the gallery view cards mapping matches
    filtered.forEach((item, index) => {
        const itemImg = item.imgUrl || "../images/Laptop.png";
        const itemName = item.name || item.itemName || "Unnamed Item";
        const finderName = item.reportedBy || item.createdBy || item.userId || item.founderName || item.reporterName || "Anonymous";
        const status = item.status || "Available";
        const idString = item._id || index.toString();

        const card = document.createElement("div");
        card.className = "items-box-item";

        card.innerHTML = `
            <div class="items-details">
                <div class="item-img">
                    <img src="${itemImg}" alt="${itemName}">
                    <p class="status ${status.toLowerCase()}">${status}</p>
                </div>

                <h2>${itemName}</h2>
                <span>${finderName}</span>
            </div>

            <button
                onclick="viewItemDetails('${idString}')"
                class="open-btn" style="width: 100%;">
                View Details
            </button>
        `;

        container.appendChild(card);
    });
}
// ===================================================
// VIEW DETAILS (ADAPTED FOR YOUR CSS CLASSES)
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
    const itemName = item.name || item.itemName || "Unnamed Item";
    const itemCategory = item.category || "General";
    const itemLocation = item.locationFound || item.location || "Unknown Location";
    const itemDate = item.dateFound || item.createdAt || "N/A";
    const itemStatus = item.status || "Available";
    const itemDescription = item.description || "No description provided.";
    const reporterId = item.reportedBy || item.createdBy || item.userId || "Anonymous";

    // Format Date beautifully
    const formattedDate = new Date(itemDate).toLocaleDateString(undefined, { dateStyle: 'medium' });

    // Inject layout structural frames matching your exact CSS names
    bottomSheet.innerHTML = `
        <div style="padding: 24px;">
            <!-- Matches your .sheet-header class -->
            <div class="sheet-header" style="margin-bottom: 20px; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                <h2 style="margin: 0; font-size: 1.4rem; color: purple;">Item Specifications</h2>
                <!-- Matches your .close-btn class -->
                <span class="close-btn" onclick="closeSheet()">&times;</span>
            </div>

            <!-- Card Showcase Viewport Structure -->
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px; max-height: 65vh; overflow-y: auto; padding-right: 4px;">
                
                <div style="position: relative; width: 100%; height: 200px; border-radius: 12px; overflow: hidden; background: #fafafa; display: flex; align-items: center; justify-content: center; border: 1px solid #eaeaea;">
                    <img src="${itemImg}" alt="${itemName}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    <span style="position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: ${itemStatus.toLowerCase() === 'available' ? '#e6f4ea' : '#feefe3'}; color: ${itemStatus.toLowerCase() === 'available' ? '#137333' : '#b06000'}; border: 1px solid currentColor;">
                        ${itemStatus}
                    </span>
                </div>

                <h1 style="margin: 0; font-size: 1.6rem; font-weight: 700; color: #111;">${itemName}</h1>

                <!-- Matches your .sheet-content-par flex distribution layout patterns -->
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

                <div class="sheet-content-par" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                    <strong style="color: #555;">Reporter ID:</strong>
                    <span style="font-family: monospace; font-size: 0.85rem; background: #f4f4f6; padding: 6px 10px; border-radius: 6px; width: 100%; box-sizing: border-box; word-break: break-all;">
                        ${reporterId}
                    </span>
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

// Fixed display adjustments parsing active state overrides safely 
function openSheet() {
    const sheet = document.getElementById("bottomSheet");
    const overlay = document.getElementById("overlay");
    
    if (sheet) {
        sheet.style.bottom = "0"; // Smooth override wrapper safety
    }
    if (overlay) {
        overlay.style.display = "block";
    }
}

function closeSheet() {
    const sheet = document.getElementById("bottomSheet");
    const overlay = document.getElementById("overlay");
    
    if (sheet) {
        sheet.style.bottom = "-100%";
    }
    if (overlay) {
        overlay.style.display = "none";
    }
}

// ===================================================
// INITIALIZE & INPUT EVENT LISTENERS
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
    // Run public items fetch immediately on page load
    fetchAndDisplayLostItems();

    // Bind inputs automatically based on ID configurations or hierarchy wrappers
    const searchInput = document.getElementById('dashboardSearch') || document.querySelector('.search-top input[type="search"]');
    const categorySelect = document.getElementById('dashboardCategoryFilter') || document.querySelector('.search-top select');
    const searchBtn = document.getElementById('dashboardSearchBtn') || document.querySelector('.search-top button');

    // Run filters immediately when text fields modify
    if (searchInput) {
        searchInput.addEventListener("input", renderFilteredItems);
    }
    // Filter on dropdown change events
    if (categorySelect) {
        categorySelect.addEventListener("change", renderFilteredItems);
    }
    // Button submit trigger assignment
    if (searchBtn) {
        searchBtn.addEventListener("click", renderFilteredItems);
    }
});