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
        selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
                                      .map(cb => cb.value.toLowerCase().trim());
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
        const itemImg = item.imgUrl || "../images/Laptop.png";
        const itemName = item.name || "Unnamed Item";
        const finderId = item.founder || "Anonymous";
        const status = item.status || "Available";
        const idString = item._id || index.toString();

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
                <span style="font-size: 0.8rem; color: gray; font-family: monospace;">Founder ID: ${finderId.substring(0, 8)}...</span>
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