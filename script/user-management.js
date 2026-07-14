// Global scope to hold the system user directory for searching
let fetchedUsersCache = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load data immediately
    loadAdminUsersDashboard();

    // 2. Set up Search Bar listener
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = fetchedUsersCache.filter(user => 
                (user.name?.toLowerCase().includes(query)) || 
                (user.matric?.toLowerCase().includes(query)) ||
                (user._id?.toLowerCase().includes(query)) // Also allows filtering by raw User ID
            );
            renderUserCards(filtered);
        });
    }
});

// Fetch and store data
async function loadAdminUsersDashboard() {
    const container = document.querySelector('#adminUsersContainer');
    
    try {
        const response = await fetch('https://ooulostandfoundportal.onrender.com/admin/get-users', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();
        const userList = result.data || result || [];

        if (Array.isArray(userList)) {
            fetchedUsersCache = userList; 
            renderUserCards(fetchedUsersCache);
        } else {
            container.innerHTML = `<p style="text-align: center;">No registered users found.</p>`;
        }
    } catch (error) {
        console.error("Failed to load user directory:", error);
        document.querySelector('#adminUsersContainer').innerHTML = `<p style="color: red; text-align: center;">Sync failed.</p>`;
    }
}

// Helper: Render logic
function renderUserCards(users) {
    const container = document.querySelector('#adminUsersContainer');
    container.innerHTML = '';
    
    if (users.length === 0) {
        container.innerHTML = `<p style="text-align: center;">No users match your search.</p>`;
        return;
    }

    users.forEach(user => {
        const avatar = user.imgUrl || "https://officialpurpled.github.io/online-voting-system/images/avatar.jpg";
        const userCard = document.createElement('div');
        userCard.className = 'user-box-item';
        userCard.innerHTML = `
            <div class="user-details">
                <div class="user-img" style="background-image: url('${avatar}'); background-size: cover; background-position: center; border-radius: 50%;"></div>
                <div class="user-det">
                    <h3>${user.name || "Unknown"}</h3>
                    <span style="font-size: 0.75rem; color: white; display: block; margin-bottom: 2px;">ID: ${user._id || "N/A"}</span>
                    <span>${user.matric || "N/A"}</span>
                    <span>${user.level ? user.level + ' Level' : "N/A"}</span>
                </div>
            </div>
            <div class="user-det-btn">
                <button onclick="viewUserDetails('${user.email}')" class="open-btn accept">View Details</button>
            </div>
        `;
        container.appendChild(userCard);
    });
}

// Modal logic
function viewUserDetails(email) {
    const targetUser = fetchedUsersCache.find(u => u.email === email);
    if (!targetUser) return;

    // Existing fields
    document.querySelector('#modalImg').src = targetUser.imgUrl || "https://officialpurpled.github.io/online-voting-system/images/avatar.jpg";
    document.querySelector('#modalName').innerText = targetUser.name || 'N/A';
    document.querySelector('#modalMatric').innerText = targetUser.matric || 'N/A';
    document.querySelector('#modalFaculty').innerText = targetUser.faculty || 'N/A';
    document.querySelector('#modalPhone').innerText = targetUser.phone || 'N/A';
    document.querySelector('#modalEmail').innerText = targetUser.email || 'N/A';

    // NEW target ID assignments
    if (document.querySelector('#modalId')) {
        document.querySelector('#modalId').innerText = targetUser._id || 'N/A';
    }
    if (document.querySelector('#modalGender')) {
        document.querySelector('#modalGender').innerText = targetUser.gender || 'N/A';
    }
    if (document.querySelector('#modalDepartment')) {
        document.querySelector('#modalDepartment').innerText = targetUser.department || 'N/A';
    }
    if (document.querySelector('#modalLevel')) {
        document.querySelector('#modalLevel').innerText = targetUser.level || 'N/A';
    }
    if (document.querySelector('#modalAddress')) {
        document.querySelector('#modalAddress').innerText = targetUser.address || 'N/A';
    }
    if (document.querySelector('#modalRole')) {
        document.querySelector('#modalRole').innerText = targetUser.role || 'N/A';
    }
    
    // WhatsApp element handling
    const whatsappEl = document.querySelector('#modalWhatsapp');
    if (whatsappEl) {
        if (targetUser.whatsapp) {
            whatsappEl.innerHTML = `<a href="${targetUser.whatsapp}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>`;
        } else {
            whatsappEl.innerText = 'N/A';
        }
    }

    // Date formatting functions
    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    if (document.querySelector('#modalCreatedAt')) {
        document.querySelector('#modalCreatedAt').innerText = formatDate(targetUser.createdAt);
    }
    if (document.querySelector('#modalUpdatedAt')) {
        document.querySelector('#modalUpdatedAt').innerText = formatDate(targetUser.updatedAt);
    }

    // Open sheet & overlay
    document.querySelector('#detailsSheet').style.display = 'block';
    document.querySelector('#overlay').style.display = 'block';
}

function closeSheet() {
    document.querySelector('#detailsSheet').style.display = 'none';
    document.querySelector('#overlay').style.display = 'none';
}