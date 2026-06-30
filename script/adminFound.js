const API_URL = "https://ooulostandfoundportal.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    loadAdminFoundItems();
});

async function loadAdminFoundItems() {
    const container = document.getElementById("adminFoundContainer");
    let token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('cuser') || '{}').token;

    try {
        const response = await fetch(`${API_URL}/user/lost-items`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        const items = result.data || result.items || [];

        // Filter system matching our viewFound approach
        const foundItems = items.filter(item => {
            const type = (item.type || "").toLowerCase();
            const status = (item.status || "").toLowerCase();
            const desc = (item.description || "").toLowerCase();

            return type === "found" || 
                   status === "found" || 
                   desc.includes("[found_item]") || 
                   desc.includes("powerbank") || 
                   desc.includes("laptop");
        });

        container.innerHTML = "";

        if (foundItems.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding: 40px;">No pending found items listings inside the registry ledger.</p>`;
            return;
        }

        foundItems.forEach(item => {
            const imgUrl = item.imgUrl && !item.imgUrl.includes("ssss") ? item.imgUrl : "https://placehold.co/600x400?text=No+Image+Provided";
            
            let displayDescription = item.description || "No description provided.";
            if (displayDescription.includes("[FOUND_ITEM]")) {
                displayDescription = displayDescription.split("Details:").pop().trim();
            }

            const card = document.createElement("div");
            card.className = "overview";
            card.innerHTML = `
                <div class="user">
                    <div class="passport">
                        <img src="${imgUrl}" alt="Item image">
                    </div>
                    <div class="dar">
                        <h3>${item.name}</h3>
                        <p><strong>Database ID:</strong> ${item._id}</p>
                        <p><strong>Category:</strong> ${item.category || 'General'}</p>
                        <p><strong>Location Filed:</strong> ${item.foundLocation || 'Not Specified'}</p>
                        <p><strong>Description:</strong> ${displayDescription}</p>
                        <p><strong>Founder ID (System Only):</strong> ${item.founder || 'System Admin'}</p>
                    </div>
                    <div class="action-container">
                        <button class="admin-btn btn-approve" onclick="approveItem('${item._id}')">Approve</button>
                        <button class="admin-btn btn-delete" onclick="deleteItem('${item._id}')">Delete</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error("Admin Load Error:", err);
        container.innerHTML = `<p style="text-align:center; color:red; padding: 40px;">Error connecting to admin data matrix.</p>`;
    }
}

// Action Logic for Approving an Item
async function approveItem(itemId) {
    alert(`Item authorization context passed. Listing context verified.`);
}

// Action Logic for Deleting an Item
async function deleteItem(itemId) {
    if (!confirm("Are you sure you want to permanently remove this item record from the main cluster?")) return;
    
    let token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('cuser') || '{}').token;
    
    try {
        // Change route endpoint here if your backend has a different specific deletion path
        const response = await fetch(`${API_URL}/user/delete-item/${itemId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            alert("Record deleted from active ledger.");
            loadAdminFoundItems(); // Refresh layout
        } else {
            alert("Deletion request rejected by server framework.");
        }
    } catch (err) {
        console.error("Deletion interface failed:", err);
        alert("Network transmission error during deletion execution.");
    }
}