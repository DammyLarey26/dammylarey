const API_URL = "https://ooulostandfoundportal.onrender.com";
let allFoundItems = []; 

document.addEventListener("DOMContentLoaded", () => {
    fetchFoundItems();
    document.getElementById("searchBtn").addEventListener("click", handleSearchAndFilter);
    document.getElementById("proofForm").addEventListener("submit", handleProofSubmission);
});

// 🔄 Fetch and Filter Pipeline
async function fetchFoundItems() {
    const container = document.getElementById("itemsContainer");
    container.innerHTML = `<p style="text-align:center; width:100%;">Loading found items...</p>`;

    let token = localStorage.getItem('token');
    if (!token && localStorage.getItem('cuser')) {
        token = JSON.parse(localStorage.getItem('cuser')).token;
    }

    try {
        const response = await fetch(`${API_URL}/user/lost-items`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        const items = result.data || result.items || result || [];

        // 🎯 INCLUSIVE FILTER: Captures everything to ensure your items appear
        // This removes the strict "type === 'found'" requirement that was hiding your data
        allFoundItems = items.filter(item => {
            return true; // Shows all items returned by the backend
        });

        renderItemGrid(allFoundItems);
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="text-align:center; color:red;">Failed to load items list.</p>`;
    }
}

// 🖼️ Card Grid Rendering Template Engine
function renderItemGrid(itemsList) {
    const container = document.getElementById("itemsContainer");
    container.innerHTML = "";

    if (itemsList.length === 0) {
        container.innerHTML = `<p style="text-align:center; width:100%;">No items found.</p>`;
        return;
    }

    itemsList.forEach(item => {
        const imgUrl = item.imgUrl && !item.imgUrl.includes("ssss") ? item.imgUrl : "https://placehold.co/600x400?text=No+Image+Provided";
        const founderName = item.founderName || "Staff/Admin"; 

        let displayDescription = item.description || "No description provided.";
        if (displayDescription.includes("[FOUND_ITEM]")) {
            displayDescription = displayDescription.split("Details:").pop().trim();
        }

        const updatedItem = { ...item, cleanDescription: displayDescription };

        const card = document.createElement("div");
        card.className = "items-box-item";
        card.innerHTML = `
            <div class="items-details">
                <div class="item-img">
                    <img src="${imgUrl}" alt="${item.name}">
                    <p class="status">Available</p>
                </div>
                <h2>${item.name}</h2>
                <span>Found by: ${founderName}</span>
            </div>
            <button class="open-btn" onclick='openItemDetails(${JSON.stringify(updatedItem)})'>View Details</button>
            <button class="view-btn" onclick="openRequestModal('${item._id}')"><i class="fa-solid fa-check"></i> Request</button>
        `;
        container.appendChild(card);
    });
}

// 📑 Dynamic Bottom Sheet Control
window.openItemDetails = function(item) {
    const sheetContent = document.getElementById("sheetDetailsContent");
    const formattedDate = new Date(item.createdAt || item.foundDate).toLocaleDateString("en-GB", {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    sheetContent.innerHTML = `
      <div class="sheet-content-par"><p>Item name:</p><p>${item.name}</p></div>
      <div class="sheet-content-par"><p>Categories:</p><p>${item.category || 'General'}</p></div>
      <div class="sheet-content-par"><p>Date Found:</p><p>${formattedDate}</p></div>
      <div class="sheet-content-par"><p>Location Found:</p><p>${item.foundLocation || 'Not Specified'}</p></div>
      <div class="sheet-content-par"><p>Item description:</p><p>${item.cleanDescription || item.description || 'No description provided.'}</p></div>
    `;

    document.getElementById("bottomSheet").classList.add("active");
    document.getElementById("overlay").classList.add("active");
};

window.closeSheet = function() {
    document.getElementById("bottomSheet").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
};

// 🙋‍♂️ Claim Modal
window.openRequestModal = function(itemId) {
    document.getElementById("modalItemId").value = itemId;
    document.getElementById("proofModal").style.display = "block";
};

window.closeModal = function() {
    document.getElementById("proofModal").style.display = "none";
    document.getElementById("proofForm").reset();
};

async function handleProofSubmission(e) {
    e.preventDefault();
    const itemId = document.getElementById("modalItemId").value;
    alert(`Claim validation payload generated for Item Ref ID: ${itemId}`);
    closeModal();
}

// 🔍 Search Handling
function handleSearchAndFilter() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    const category = document.getElementById("categoryFilter").value.toLowerCase();

    const filtered = allFoundItems.filter(item => {
        const matchesCategory = !category || item.category?.toLowerCase() === category;
        const matchesQuery = !query || 
            item.name?.toLowerCase().includes(query) || 
            item.foundLocation?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
    });

    renderItemGrid(filtered);
}