//const nameElem = document.querySelector('#name'); 
//const imgElem = document.querySelector('#img'); 

//const user = JSON.parse(localStorage.getItem('cuser')) 

//nameElem.innerText = user.name.split(' ')[1] 
//imgElem.src = user.imgUrl
// ==========================================
// ==========================================
// ==========================================
// ==========================================
// 1. SIMPLE ROUTING GUARD & LOGOUT HANDLER
// ==========================================
if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.replace('./login.html');
}

window.forceLogout = function(e) {
    if (e) e.preventDefault();
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        sessionStorage.clear();
        localStorage.clear();
        window.location.replace('./login.html');
    }
};

// ==========================================
// 2. FETCH PROFILE DYNAMICALLY FROM DATABASE
// ==========================================
// ==========================================
// 2. FETCH PROFILE DYNAMICALLY FROM DATABASE
// ==========================================
async function loadDashboardProfile() {
    const nameElem = document.querySelector('#name'); 
    const idElem = document.querySelector('#userId'); 
    const imgElem = document.querySelector('#img'); 
    
    const token = localStorage.getItem('token');
    const loggedInEmail = localStorage.getItem('loggedInEmail'); // 🌟 Get the current user's email

    try {
        // Fetching the user list from your Render database backend
        const response = await fetch('https://ooulostandfoundportal.onrender.com/admin/get-users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            
            // 🕵️‍♂️ FIND THE SPECIFIC USER MATCHING THE LOGGED-IN EMAIL
            const currentUser = result.data.find(user => user.email === loggedInEmail); 

            if (currentUser) {
                // Save it locally as backup
                localStorage.setItem('cuser', JSON.stringify(currentUser));

                // Send the actual account data directly to your HTML elements
                if (nameElem && currentUser.name) nameElem.innerText = currentUser.name;
                if (idElem && currentUser.matric) idElem.innerText = currentUser.matric;
                
                if (imgElem) {
                    imgElem.src = currentUser.imgUrl || "https://officialpurpled.github.io/online-voting-system/images/avatar.jpg";
                }
                return;
            }
        }
        fallbackToDefaults(nameElem, idElem);
    } catch (error) {
        console.error("Database connection failed:", error);
        fallbackToDefaults(nameElem, idElem);
    }
}

function fallbackToDefaults(nameElem, idElem) {
    if (nameElem) nameElem.innerText = "User Profile";
    if (idElem) idElem.innerText = "No ID Loaded";
}

// Run the profile load immediately
loadDashboardProfile();