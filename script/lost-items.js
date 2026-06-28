// Local cache array to store the fetched items payload
let lostItemsCache = [];

async function fetchAndDisplayLostItems() {
    const container = document.querySelector('#lostItemsContainer');
    const token = localStorage.getItem('token');

    if (!token) {
        if (container) container.innerHTML = `<p style="color: red; text-align: center; width: 100%;">Authentication required. Please log in.</p>`;
        return;
    }

    try {
        // Fetch items array from your Render server API path
        const response = await fetch('https://ooulostandfoundportal.onrender.com/user/lost-items', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        // Check for common backend response arrays (adjust if backend key differs)
        const itemsList = result.data || result.items || result;

        if (Array.isArray(itemsList)) {
            // Store it into the local cache map
            lostItemsCache = itemsList;
            container.innerHTML = '';

            itemsList.forEach((item, index) => {
                // Safe data fallbacks matching your structural layout
                const itemImg = item.imgUrl || "../images/Laptop.png";
                const itemName = item.name || item.itemName || "Unnamed Item";
                const finderName = item.finderName || item.reporterName || "Anonymous";
                const status = item.status || "Available";

                // Generate structural template cards matching your native design rules
                const card = document.createElement('div');
                card.className = 'items-box-item';

                card.innerHTML = `
                    <div class="items-details">
                        <div class="item-img">
                            <img src="${itemImg}" alt="${itemName}">
                            <p class="status ${status.toLowerCase()}">${status}</p>
                        </div>
                        <h2>${itemName}</h2>
                        <span>${finderName}</span>
                    </div>
                    <button onclick="viewItemDetails('${item._id || index}')" class="open-btn">View Details</button>
                `;

                container.appendChild(card);
            });

            if (itemsList.length === 0) {
                container.innerHTML = `<p style="text-align: center; width: 100%; color: gray;">No reported items listed in the database directory yet.</p>`;
            }

        } else {
            container.innerHTML = `<p style="color: orange; text-align: center; width: 100%;">Invalid dataset response layout from server.</p>`;
        }
    } catch (error) {
        console.error("Failed to query lost items feed data:", error);
        container.innerHTML = `<p style="color: red; text-align: center; width: 100%;">Server network offline or under construction.</p>`;
    }
}

// ===================================================
// DYNAMIC BOTTOM SHEET ENGINE ACTIONS
// ===================================================
function viewItemDetails(identifier) {
    // Search the cache by MongoDB _id, or index fallback matching array assignments
    const item = lostItemsCache.find((u, index) => (u._id === identifier || index.toString() === identifier));

    if (!item) {
        console.error("Item mapping data missing from memory stack matrix.");
        return;
    }

    // Assign text updates directly into the sheet placeholder elements
    document.querySelector('#sheetItemName').innerText = item.name || item.itemName || 'N/A';
    document.querySelector('#sheetCategory').innerText = item.category || 'General Electronics';
    document.querySelector('#sheetDate').innerText = item.dateFound || item.createdAt || 'N/A';
    document.querySelector('#sheetLocation').innerText = item.locationFound || item.location || 'N/A';
    document.querySelector('#sheetDescription').innerText = item.description || 'No descriptive details submitted.';

    // Execute structural interface view opening animations
    openSheet();
}

function openSheet() {
    const sheet = document.querySelector('#bottomSheet');
    const overlay = document.querySelector('#overlay');
    
    if (sheet) sheet.classList.add('active'); // Assumes your style utilizes an '.active' transition flag
    if (overlay) overlay.style.display = 'block';
}

function closeSheet() {
    const sheet = document.querySelector('#bottomSheet');
    const overlay = document.querySelector('#overlay');
    
    if (sheet) sheet.classList.remove('active');
    if (overlay) overlay.style.display = 'none';
}

// Initial Data Pull initialization listener
document.addEventListener('DOMContentLoaded', fetchAndDisplayLostItems);