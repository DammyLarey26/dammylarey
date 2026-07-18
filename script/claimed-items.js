let allItems = [];

// API Operations Engine
async function fetchFoundItems() {
    const container = document.getElementById('itemsContainer');
    
    // Safety check in case the ID is missing from the page
    if (!container) return;

    try {
        // Clear previous state and show clean simple text loader
        container.innerHTML = `<div style="text-align: center; padding: 30px; font-size: 14px; color: #666; width: 100%;">Querying server database context...</div>`;

        const token = localStorage.getItem('token'); 

        if (!token) {
            container.innerHTML = `<div style="text-align: center; padding: 30px; font-size: 14px; width: 100%; color:red; font-weight:bold;">
                Access Denied. Please <a href="login.html" style="color:#111; text-decoration:underline;">login</a> to view items.
            </div>`;
            return;
        }

        const response = await fetch("https://ooulostandfoundportal.onrender.com/user/found-items", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to load portal items.");
        }

        const dataArray = result.data || result.items || result || [];
        
        // Filter array elements matching finalized approved verification states
        allItems = dataArray.filter(item => {
            const status = (item.status || "").toLowerCase();
            return status === "approved" || status === "claimed" || status === "resolved";
        });

        renderGrid(allItems);

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div style="text-align: center; padding: 30px; font-size: 14px; width: 100%; color:red;">Error: ${error.message}</div>`;
    }
}

// Compact Item Card Grid Component Renderer
function renderGrid(items) {
    const container = document.getElementById('itemsContainer');
    if (!container) return;
    
    // Clear out container contents entirely
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 30px; font-size: 14px; color: #666; width: 100%;">No approved items found matching your search details.</div>`;
        return;
    }

    // Dynamic inner layout injection module
    items.forEach(item => {
        const image = item.imgUrl || "https://placeholder.co/400x300?text=No+Image+Provided";
        const name = item.name || "Unnamed Item";
        const location = item.foundLocation || "Not Specified";
        const status = item.status || "Approved";
        
        const rawDate = item.foundDate || item.createdAt;
        const displayDate = rawDate ? new Date(rawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A";
        
        const approvalRaw = item.updatedAt || item.createdAt;
        const approvalDate = approvalRaw ? new Date(approvalRaw).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A";

        const cardElement = document.createElement('div');
        cardElement.className = 'claim-card';
        cardElement.innerHTML = `
            <img src="${image}" alt="${name}">
            <div class="content">
                <h3>${name}</h3>
                <span class="badge ${status.toLowerCase()}">${status}</span>
                
                <p><i class="fas fa-map-marker-alt"></i> ${location}</p>
                <p><i class="fas fa-calendar-alt"></i> Found: ${displayDate}</p>
                <p><i class="fas fa-paper-plane"></i> Claimed: ${approvalDate}</p>
                
                <div class="buttons">
                    <button class="view view-btn">View Details</button>
                </div>
            </div>
        `;

        // Event listener for view action trigger framework details
        cardElement.querySelector('.view-btn').addEventListener('click', () => {
            alert(`Item: ${name}\nLocation: ${location}\nDate Found: ${displayDate}\nStatus: ${status}`);
        });

        container.appendChild(cardElement);
    });
}

// Global invocation event hook configurations
document.addEventListener("DOMContentLoaded", fetchFoundItems);