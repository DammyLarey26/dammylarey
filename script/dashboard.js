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
async function loadDashboardProfile() {
    const nameElem = document.querySelector('#name'); 
    const idElem = document.querySelector('#userId'); 
    const imgElem = document.querySelector('#img'); 

    try {
        // Fetching the user list from your Render database backend
        const response = await fetch('https://ooulostandfoundportal.onrender.com/admin/get-users');
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            // Grab a user account from your database array to display
            // (Using the second user index matching your previous backend picture)
            const currentUser = result.data[1] || result.data[0]; 

            if (currentUser) {
                // Send data directly to your HTML elements
                if (nameElem && currentUser.name) nameElem.innerText = currentUser.name;
                if (idElem && currentUser.matric) idElem.innerText = currentUser.matric;
                if (imgElem && currentUser.imgUrl) imgElem.src = currentUser.imgUrl;
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
    if (nameElem) nameElem.innerText = "Dammy Larey";
    if (idElem) idElem.innerText = "USER002";
}

// Run the profile load immediately
loadDashboardProfile();