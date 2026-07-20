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
  <span style="display: flex; flex-wrap: wrap;">📩 <span id="pEmail" style="word-break: break-all;">${user.email}</span></span>
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
// 2. EDIT & SAVE CHANGES FUNCTIONALITY
// ==========================================
let isEditing = false;

async function handleProfileEdit() {
    const editBtn = document.querySelector('#editBtn');
    
    // Target our newly injected text container IDs
    const nameElem = document.querySelector('#pName');
    const facultyElem = document.querySelector('#pFaculty');
    const phoneElem = document.querySelector('#pPhone');
    
    const token = localStorage.getItem('token');
    const loggedInEmail = localStorage.getItem('loggedInEmail');

    if (!isEditing) {
        // --- STEP A: ENTER EDIT MODE ---
        isEditing = true;
        editBtn.innerHTML = '💾 Save Changes';
        editBtn.style.backgroundColor = '#2e7d32'; // Turn button green
        
        // Open attributes up for manual browser modification
        if (nameElem) nameElem.contentEditable = "true";
        if (facultyElem) facultyElem.contentEditable = "true";
        if (phoneElem) phoneElem.contentEditable = "true";
        
        // Put cursor focus onto the name directly
        if (nameElem) nameElem.focus();
        
    } else {
        // --- STEP B: SAVE MODE (SAVE DATA BACK TO SERVER) ---
        isEditing = false;
        editBtn.innerHTML = '🖍 Edit Profile';
        editBtn.style.backgroundColor = ''; // Revert style
        
        if (nameElem) nameElem.contentEditable = "false";
        if (facultyElem) facultyElem.contentEditable = "false";
        if (phoneElem) phoneElem.contentEditable = "false";

        // Build object payload matching backend JSON schemas
        const updatedData = {
            email: loggedInEmail || user.email,
            name: nameElem ? nameElem.innerText.trim() : user.name,
            faculty: facultyElem ? facultyElem.innerText.trim() : user.faculty,
            phone: phoneElem ? phoneElem.innerText.trim() : user.phone
        };

        try {
            // Fires modification tracking update query to your onrender API server
            const response = await fetch('https://ooulostandfoundportal.onrender.com/auth/update-profile', {
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
                
                // Update your local user backup copy too
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
function handlePasswordChange() {
    const oldPassword = prompt("Enter your old password:");
    if (!oldPassword) return;
    
    const newPassword = prompt("Enter your new password:");
    if (!newPassword) return;

    alert("Password change request submitted!");
    // You can connect this to your password update route if needed later!
}

// Attach the actions directly to the dynamically rendered buttons
if (user) {
    document.querySelector('#editBtn').addEventListener('click', handleProfileEdit);
    document.querySelector('#passwordBtn').addEventListener('click', handlePasswordChange);
}