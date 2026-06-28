// Global scope array to hold the system user directory once extracted
let fetchedUsersCache = [];

async function loadAdminUsersDashboard() {
    const container = document.querySelector('#adminUsersContainer');
    const token = localStorage.getItem('token');

    if (!token) {
        if (container) container.innerHTML = `<p style="color: red; text-align: center; width: 100%;">Unauthorized. Please log in first.</p>`;
        return;
    }

    try {
        const response = await fetch('https://ooulostandfoundportal.onrender.com/admin/get-users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            container.innerHTML = '';
            
            // 💾 SAVE DATA TO CACHE FOR MODAL ACTIONS
            fetchedUsersCache = result.data; 

            result.data.forEach(user => {
                const avatar = user.imgUrl || "https://officialpurpled.github.io/online-voting-system/images/avatar.jpg";
                const name = user.name || "Unknown User";
                const matric = user.matric || "No Matric Number";
                const level = user.level || "400 Level";

                const userCard = document.createElement('div');
                userCard.className = 'user-box-item';
                
                userCard.innerHTML = `
                    <div class="user-details">
                        <div class="user-img" style="background-image: url('${avatar}'); background-size: cover; background-position: center; border-radius: 50%;"></div>
                        <div class="user-det">
                            <h3>${name}</h3>
                            <span>${matric}</span>
                            <span>${level}</span>
                        </div>
                    </div>
                    <div class="user-det-btn">
                        <button class="reject" onclick="deleteUserAccount('${user.email}')">Delete Account</button>
                        <button onclick="viewUserDetails('${user.email}')" class="open-btn accept">View Details</button>
                    </div>
                `;

                container.appendChild(userCard);
            });

            if (result.data.length === 0) {
                container.innerHTML = `<p style="text-align: center; width: 100%;">No registered users found.</p>`;
            }
        }
    } catch (error) {
        console.error("Failed to load admin directory data:", error);
    }
}

// ===================================================
// DYNAMIC MODAL MODIFIER FUNCTIONS
// ===================================================
function viewUserDetails(email) {
    // Search cache array to find matching profile metrics
    const targetUser = fetchedUsersCache.find(u => u.email === email);
    
    if (!targetUser) {
        alert("Could not process record details layout mapping.");
        return;
    }

    // Assign text node definitions into corresponding DOM layout nodes
    document.querySelector('#modalImg').src = targetUser.imgUrl || "https://officialpurpled.github.io/online-voting-system/images/avatar.jpg";
    document.querySelector('#modalName').innerText = targetUser.name || 'N/A';
    document.querySelector('#modalMatric').innerText = targetUser.matric || 'N/A';
    document.querySelector('#modalFaculty').innerText = targetUser.faculty ? (targetUser.faculty.toUpperCase()[0] + targetUser.faculty.slice(1)) : 'N/A';
    document.querySelector('#modalPhone').innerText = targetUser.phone || 'N/A';
    document.querySelector('#modalEmail').innerText = targetUser.email || 'N/A';

    // Open sheet visuals and overlay backdrops
    openSheet();
}

function openSheet() {
    document.querySelector('#detailsSheet').style.display = 'block';
    document.querySelector('#overlay').style.display = 'block';
}

function closeSheet() {
    document.querySelector('#detailsSheet').style.display = 'none';
    document.querySelector('#overlay').style.display = 'none';
}

// Initialize on Document Layout Load
document.addEventListener('DOMContentLoaded', loadAdminUsersDashboard);