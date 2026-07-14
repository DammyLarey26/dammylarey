// ==========================================
// ADMIN SESSION MANAGER
// ==========================================

const LOGIN_PAGE = "admin-log.html";
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Check login
function isAdminLoggedIn() {
    return sessionStorage.getItem("adminLoggedIn") === "true";
}

// End session
function endAdminSession(message = "Your session has expired. Please log in again.") {

    sessionStorage.clear();

    alert(message);

    window.location.replace(LOGIN_PAGE);

}

// Update activity time
function updateActivity() {

    if (!isAdminLoggedIn()) return;

    sessionStorage.setItem("adminLastActivity", Date.now());

}

// Check inactivity
function checkSession() {

    if (!isAdminLoggedIn()) {

        window.location.replace(LOGIN_PAGE);
        return;

    }

    const lastActivity = Number(sessionStorage.getItem("adminLastActivity")) || 0;

    const now = Date.now();

    if (now - lastActivity > SESSION_TIMEOUT) {

        endAdminSession("Your admin session expired due to inactivity.");

    }

}

// Protect page immediately
(function () {

    if (!isAdminLoggedIn()) {

        window.location.replace(LOGIN_PAGE);
        return;

    }

    updateActivity();

    [
        "click",
        "mousemove",
        "keydown",
        "scroll",
        "touchstart",
        "touchmove",
        "mousedown"
    ].forEach(event => {

        document.addEventListener(event, updateActivity, true);

    });

    // Check every second
    setInterval(checkSession, 1000);

})();