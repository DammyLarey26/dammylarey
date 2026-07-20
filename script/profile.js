// ==========================================
// 1. INITIAL LOAD: RENDER USER FROM STORAGE
// ==========================================
const user = JSON.parse(localStorage.getItem('cuser'));
const userDetails = document.querySelector('#profile-box');

if (user) {
  userDetails.innerHTML = `
    <div class="passport dar">
      <img src="${user.imgUrl || '../images/lekan.jpg'}" id="profileImg" alt="Profile Picture">
    </div>
    <div class="det">
  <span>👨‍🎓 <span id="pName">${user.name}</span></span>
  <span>🆔 <span id="pMatric">${user.matricNumber || user.matric || 'N/A'}</span></span>
  <span>💼 <span id="pFaculty">${user.faculty ? (user.faculty.toUpperCase()[0] + user.faculty.slice(1)) : 'N/A'}</span></span>
  <span>📞 <span id="pPhone">${user.phone || 'N/A'}</span></span>
  <span>📩 <span id="pEmail">${user.email}</span></span>
  <div class="det-btn">
    <button id="editBtn">🖍 Edit Profile</button>
    <button id="passwordBtn">⚙ Change Password</button>
    <button id="deleteAccountBtn" class="delete-btn">🗑 Delete Account</button>
  </div>
</div>
  `;
} else {
  console.log("No profile information cached.");
}

// ==========================================
// ROUTE CONFIGURATION
// If you get a 404, change '/auth' below to '/user' or whatever your backend base path is for these updates
// ==========================================
const BACKEND_BASE = 'https://ooulostandfoundportal.onrender.com';
const BASE_ROUTE = '/auth'; // Try changing this to '/user' if it keeps returning a 404!

// ==========================================
// 2. EDIT & SAVE CHANGES FUNCTIONALITY
// ==========================================
let isEditing = false;

async function handleProfileEdit() {
    const editBtn = document.querySelector('#editBtn');
    const nameElem = document.querySelector('#pName');
    const facultyElem = document.querySelector('#pFaculty');
    const phoneElem = document.querySelector('#pPhone');
    
    const token = localStorage.getItem('token');
    const loggedInEmail = localStorage.getItem('loggedInEmail');

    if (!isEditing) {
        isEditing = true;
        editBtn.innerHTML = '💾 Save Changes';
        editBtn.style.backgroundColor = '#2e7d32'; 
        
        if (nameElem) nameElem.contentEditable = "true";
        if (facultyElem) facultyElem.contentEditable = "true";
        if (phoneElem) phoneElem.contentEditable = "true";
        if (nameElem) nameElem.focus();
        
    } else {
        isEditing = false;
        editBtn.innerHTML = '🖍 Edit Profile';
        editBtn.style.backgroundColor = ''; 
        
        if (nameElem) nameElem.contentEditable = "false";
        if (facultyElem) facultyElem.contentEditable = "false";
        if (phoneElem) phoneElem.contentEditable = "false";

        const updatedData = {
            email: loggedInEmail || user.email,
            name: nameElem ? nameElem.innerText.trim() : user.name,
            faculty: facultyElem ? facultyElem.innerText.trim() : user.faculty,
            phone: phoneElem ? phoneElem.innerText.trim() : user.phone
        };

        try {
            const response = await fetch(`${BACKEND_BASE}${BASE_ROUTE}/update-profile`, {
                method: 'PUT', 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (response.status === 200 || result.success) {
                alert("Profile changes successfully updated in the database!");
                const mergedUser = { ...user, ...updatedData };
                localStorage.setItem('cuser', JSON.stringify(mergedUser));
            } else {
                alert(result.message || "Server declined to update properties.");
            }
        } catch (error) {
            console.error("Database connection failure:", error);
            alert("Database connection failed. Sync aborted.");
        }
    }
}

// ==========================================
// 3. CHANGE PASSWORD TRIGGER
// ==========================================
async function handlePasswordChange() {
    const oldPassword = prompt("Enter your old password:");
    if (!oldPassword) return;
    
    const newPassword = prompt("Enter your new password:");
    if (!newPassword) return;

    const token = localStorage.getItem('token');
    const loggedInEmail = localStorage.getItem('loggedInEmail');

    const passwordPayload = {
        email: loggedInEmail || user?.email,
        oldPassword: oldPassword,
        newPassword: newPassword
    };

    try {
        const response = await fetch(`${BACKEND_BASE}${BASE_ROUTE}/change-password`, {
            method: 'PATCH', 
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(passwordPayload)
        });

        const rawText = await response.text();
        let result;
        try { result = JSON.parse(rawText); } catch(e) { result = {}; }

        if (response.status === 200 || response.status === 201 || result.success) {
            alert("Password successfully changed!");
        } else {
            alert(`Failed (${response.status}): ${result.message || "Route not found or bad request."}`);
        }
    } catch (error) {
        console.error("Password update error:", error);
        alert(`Network Error: ${error.message}`);
    }
}

// ==========================================
// 4. DELETE ACCOUNT TRIGGER
// ==========================================
async function handleDeleteAccount() {
    const confirmDelete = confirm("⚠️ WARNING: Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    const loggedInEmail = localStorage.getItem('loggedInEmail');

    try {
        const response = await fetch(`${BACKEND_BASE}${BASE_ROUTE}/delete-account`, {
            method: 'DELETE', 
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: loggedInEmail || user?.email })
        });

        const rawText = await response.text();
        let result;
        try { result = JSON.parse(rawText); } catch(e) { result = {}; }

        if (response.status === 200 || result.success) {
            alert("Your account has been successfully deleted.");
            localStorage.clear();
            window.location.href = '../index.html'; 
        } else {
            alert(`Failed (${response.status}): ${result.message || "Route not found or bad request."}`);
        }
    } catch (error) {
        console.error("Account deletion error:", error);
        alert(`Network Error: ${error.message}`);
    }
}

// Attach the actions directly to the dynamically rendered buttons
if (user) {
    document.querySelector('#editBtn').addEventListener('click', handleProfileEdit);
    document.querySelector('#passwordBtn').addEventListener('click', handlePasswordChange);
    document.querySelector('#deleteAccountBtn').addEventListener('click', handleDeleteAccount);
}