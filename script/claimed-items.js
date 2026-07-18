let allItems = [];
const container = document.getElementById('itemsContainer');
const loadingStatus = document.getElementById('loadingStatus');
const statusMessage = document.getElementById('statusMessage');
const searchInput = document.getElementById('searchInput');

// API Operations Engine
async function fetchFoundItems() {
    try {
        loadingStatus.style.display = 'block';
        statusMessage.style.display = 'none';

        const token = localStorage.getItem('token'); 

        if (!token) {
            loadingStatus.style.display = 'none';
            statusMessage.style.display = 'block';
            statusMessage.innerHTML = `<span style="color:red; font-weight:bold;">
                Access Denied. Please <a href="login.html" style="color:#111; text-decoration:underline;">login</a> to view items.
            </span>`;
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
        loadingStatus.style.display = 'none';

        if (!response.ok) {
            throw new Error(result.message || "Failed to load portal items.");
        }

        const dataArray = result.data || result.items || result || [];
        
        // Dynamically compute dashboard numbers into top stat panels
        updateStatisticsCounters(dataArray);

        // Filter array elements matching finalized approved verification states
        allItems = dataArray.filter(item => {
            const status = (item.status || "").toLowerCase();
            return status === "approved" || status === "claimed" || status === "resolved";
        });

        renderGrid(allItems);

    } catch (error) {
        console.error(error);
        loadingStatus.style.display = 'none';
        statusMessage.style.display = 'block';
        statusMessage.innerHTML = `<span style="color:red;">Error: ${error.message}</span>`;
    }
}

// Stats counter logic
function updateStatisticsCounters(items) {
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    items.forEach(item => {
        const s = (item.status || "").toLowerCase();
        if (s === "pending") pendingCount++;
        else if (s === "approved" || s === "claimed" || s === "resolved") approvedCount++;
        else if (s === "rejected") rejectedCount++;
    });

    const pendingEl = document.querySelector('.stat-card.pending h2');
    const approvedEl = document.querySelector('.stat-card.approved h2');
    const rejectedEl = document.querySelector('.stat-card.rejected h2');

    if (pendingEl) pendingEl.innerText = pendingCount;
    if (approvedEl) approvedEl.innerText = approvedCount;
    if (rejectedEl) rejectedEl.innerText = rejectedCount;
}

// Compact Item Card Grid Component Renderer
function renderGrid(items) {
    const existingCards = container.querySelectorAll('.claim-card');
    existingCards.forEach(card => card.remove());

    if (items.length === 0) {
        statusMessage.style.display = 'block';
        statusMessage.innerText = "No approved items match your search details.";
        return;
    }

    statusMessage.style.display = 'none';

    items.forEach(item => {
        const image = item.imgUrl || "https://placeholder.co/400x300?text=No+Image+Provided";
        const name = item.name || "Unnamed Item";
        const description = item.description || "No description provided.";
        const category = item.category || "General";
        const location = item.foundLocation || "Not Specified";
        const status = item.status || "Approved";
        
        const founder = item.founder || {};
        const founderName = founder.name || "Anonymous";
        const founderMatric = founder.matric || "N/A";

        const rawDate = item.foundDate || item.createdAt;
        const displayDate = rawDate ? new Date(rawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A";
        
        const approvalRaw = item.updatedAt || item.createdAt;
        const approvalDate = approvalRaw ? new Date(approvalRaw).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A";
        const approvalTime = approvalRaw ? new Date(approvalRaw).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A";

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

        cardElement.querySelector('.view-btn').addEventListener('click', () => {
            openModal(
                name, image, category, location, displayDate, description, 
                founderName, founderMatric, approvalDate, approvalTime
            );
        });

        container.appendChild(cardElement);
    });
}

// Modal Controllers
function openModal(title, image, category, location, dateFound, description, founder, founderId, approvedDate, approvedTime) {
    document.getElementById("modal").style.display = "flex";
    document.getElementById("mTitle").innerHTML = title;
    document.getElementById("mImage").src = image;
    document.getElementById("mCategory").innerHTML = category;
    document.getElementById("mLocation").innerHTML = location;
    document.getElementById("mDateFound").innerHTML = dateFound;
    document.getElementById("mDescription").innerHTML = description;
    document.getElementById("mFinder").innerHTML = founder;
    document.getElementById("mFinderId").innerHTML = founderId;
    document.getElementById("mApproveDate").innerHTML = approvedDate;
    document.getElementById("mApproveTime").innerHTML = approvedTime;
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

document.getElementById("closeModalBtn").addEventListener('click', closeModal);
document.getElementById("modalCloseBtn").addEventListener('click', closeModal);

window.onclick = function(e) {
    if (e.target == document.getElementById("modal")) {
        closeModal();
    }
}

// Live Search Filter Handler
if (searchInput) {
    searchInput.addEventListener("input", function () {
        const keyword = this.value.toLowerCase();

        const filtered = allItems.filter(item => {
            const founder = item.founder || {};
            return (
                (item.name || "").toLowerCase().includes(keyword) ||
                (item.foundLocation || "").toLowerCase().includes(keyword) ||
                (item.category || "").toLowerCase().includes(keyword) ||
                (item.description || "").toLowerCase().includes(keyword) ||
                (founder.name || "").toLowerCase().includes(keyword) ||
                (founder.matric || "").toLowerCase().includes(keyword)
            );
        });

        renderGrid(filtered);
    });
}

document.addEventListener("DOMContentLoaded", fetchFoundItems);