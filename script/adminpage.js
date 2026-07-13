// ===================================================
// ADMIN ACCESS GATEKEEPER
// ===================================================
(function checkAdminAuthorization() {
    let token = localStorage.getItem("token");
    let isAuthorized = false;

    // Check fallback session schema if global token isn't directly set
    if (!token && localStorage.getItem("cuser")) {
        try {
            const parsedUser = JSON.parse(localStorage.getItem("cuser"));
            token = parsedUser.token || parsedUser.accessToken;
            
            // OPTIONAL: If your backend tags administrative roles explicitly
            // if (parsedUser.role !== 'admin') { token = null; }
        } catch (e) {
            console.error("Session corruption detected.");
        }
    }

    // If no valid auth payload token exists, kick them out immediately
    if (!token) {
        // Prevent flashing layout content to unauthorized intruders
        document.documentElement.style.display = 'none'; 
        
        alert("Access Denied. Administrator authentication required.");
        window.location.replace("./admin-login.html"); // Using replace avoids back-button loops
    }
})();

// ===================================================
// GLOBAL ADMIN SHARED SERVICES (Optional Helpers)
// ===================================================
window.AdminSession = {
    getToken: function() {
        let token = localStorage.getItem("token");
        if (!token && localStorage.getItem("cuser")) {
            const parsedUser = JSON.parse(localStorage.getItem("cuser"));
            token = parsedUser.token || parsedUser.accessToken;
        }
        return token;
    },
    
    logout: function() {
        localStorage.removeItem("token");
        localStorage.removeItem("cuser");
        alert("Logged out successfully.");
        window.location.replace("./admin-login.html");
    }
};