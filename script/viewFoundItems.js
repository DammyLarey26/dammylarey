// Local cache array to store the fetched items payload
let lostItemsCache = [];
const API_URL = "https://ooulostandfoundportal.onrender.com";

async function fetchAndDisplayLostItems() {
    const container = document.querySelector('#lostItemsContainer');
    let token = localStorage.getItem('token');
    
    if (!token && localStorage.getItem('cuser')) {
        token = JSON.parse(localStorage.getItem('cuser')).token;
    }

    if (!token) {
        if (container) container.innerHTML = `<p style="color: red; text-align: center; width: 100%;">Authentication required. Please log in.</p>`;
        return;
    }

    try {
        // 🔄 Updated endpoint route path from /user/lost-items to /user/report
        const response = await fetch(`${API_URL}/user/report`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        // Check for common backend response arrays
        const itemsList = result.data || result.items || result;

        if (Array.isArray(itemsList)) {
            lostItemsCache = itemsList;
            container.innerHTML = '';

            itemsList.forEach((item, index) => {
                const itemImg = item.imgUrl || "../images/Laptop.png";
                const itemName = item.name || item.itemName || "Unnamed Item";
                const finderName = item.founderName || item.reporterName || "Anonymous";
                const status = item.status || "Available";
                const idString = item._id || index.toString();

                const card = document.createElement('div');
                card.className = 'items-box-item';

                // ✨ Injected Request button targeting the global modal launcher element pattern
                card.innerHTML = `
                    <div class="items-details">
                        <div class="item-img">
                            <img src="${itemImg}" alt="${itemName}">
                            <p class="status ${status.toLowerCase()}">${status}</p>
                        </div>
                        <h2>${itemName}</h2>
                        <span>${finderName}</span>
                    </div>
                    <button onclick="viewItemDetails('${idString}')" class="open-btn">View Details</button>
                    <button onclick="openRequestModal('${idString}')" class="view-btn"><i class="fa-solid fa-check"></i> Request</button>
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
    const item = lostItemsCache.find((u, index) => (u._id === identifier || index.toString() === identifier));

    if (!item) {
        console.error("Item mapping data missing from memory stack matrix.");
        return;
    }

    document.querySelector('#sheetItemName').innerText = item.name || item.itemName || 'N/A';
    document.querySelector('#sheetCategory').innerText = item.category || 'General Electronics';
    document.querySelector('#sheetDate').innerText = item.dateFound || item.createdAt || 'N/A';
    document.querySelector('#sheetLocation').innerText = item.locationFound || item.location || 'N/A';
    document.querySelector('#sheetDescription').innerText = item.description || 'No descriptive details submitted.';

    openSheet();
}

function openSheet() {
    const sheet = document.querySelector('#bottomSheet');
    const overlay = document.querySelector('#overlay');
    
    if (sheet) sheet.classList.add('active'); 
    if (overlay) overlay.style.display = 'block';
}

function closeSheet() {
    const sheet = document.querySelector('#bottomSheet');
    const overlay = document.querySelector('#overlay');
    
    if (sheet) sheet.classList.remove('active');
    if (overlay) overlay.style.display = 'none';
}

// ===================================================
// 🙋‍♂️ PROOF / CLAIM INTERACTION MODAL FUNCTIONS
// ===================================================
window.openRequestModal = function(itemId) {
    const modal = document.getElementById("proofModal");
    const inputId = document.getElementById("modalItemId");
    if (inputId) inputId.value = itemId;
    if (modal) modal.style.display = "block";
};

window.closeModal = function() {
    const modal = document.getElementById("proofModal");
    const form = document.getElementById("proofForm");
    if (modal) modal.style.display = "none";
    if (form) form.reset();
};

async function handleProofSubmission(e) {
    e.preventDefault();

    const itemId = document.getElementById("modalItemId").value;
    const description = document.getElementById("proofDescription").value;
    const additionalInfo = document.getElementById("proofAdditional").value;
    const fileInput = document.getElementById("proofFile");
    
    let token = localStorage.getItem('token');
    if (!token && localStorage.getItem('cuser')) {
        token = JSON.parse(localStorage.getItem('cuser')).token;
    }

    // Wrap elements inside FormData format to support uploaded image attachments gracefully
    const formData = new FormData();
    formData.append("itemId", itemId);
    formData.append("proofDescription", description);
    formData.append("additionalInfo", additionalInfo);

    if (fileInput && fileInput.files.length > 0) {
        formData.append("proofFile", fileInput.files[0]);
    }

    try {
        // 📤 POST claim data transaction block
        const response = await fetch(`${API_URL}/user/claim-item`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
                // Note: Content-Type omitted dynamically to protect the automatic boundary layout values
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok || result.success) {
            alert("Claim request submitted successfully!");
            closeModal();
            fetchAndDisplayLostItems(); // Hot reload feed data status structures
        } else {
            alert(`Submission failed: ${result.message || "Rejected by portal system"}`);
        }
    } catch (err) {
        console.error("Error submitting request proof parameters:", err);
        alert("A network operational failure disrupted verification communication.");
    }
}

// Initial Data Pull initialization listener
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayLostItems();
    
    const proofForm = document.getElementById("proofForm");
    if (proofForm) {
        proofForm.addEventListener("submit", handleProofSubmission);
    }
});
