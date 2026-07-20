// ==========================================
// SESSION MANAGEMENT
// ==========================================

const LOGIN_PAGE = "./login.html";
const TIMEOUT_LIMIT = 15 * 60 * 1000; // 15 minutes

let sessionTimer;

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem("token");
    const loggedIn = sessionStorage.getItem("loggedIn");

    return token && loggedIn === "true";
}

// End session
function endSession(message = "Your session has expired. Please log in again.") {
    // Prevent multiple executions on the same page
    if (window.__sessionEnded) return;
    window.__sessionEnded = true;

    // Disable page interaction immediately
    document.body.style.pointerEvents = "none";
    document.body.style.opacity = "0.6";

    // Save the current page path so login.html knows where to send them back
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);

    // Capture the auth status BEFORE we clear the tokens
    const wasStillAuthenticated = isAuthenticated();

    // Clear session data
    sessionStorage.removeItem("loggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("cuser");

    // Only alert if the session was active on THIS tab before this function ran.
    // If they already logged out in another tab, wasStillAuthenticated will be false.
    if (wasStillAuthenticated) {
        alert(message);
    }

    window.location.replace(LOGIN_PAGE);
}

// Start inactivity timer
function startSessionTimer() {
    clearTimeout(sessionTimer);

    sessionTimer = setTimeout(() => {
        endSession("Your session has expired due to inactivity. Please log in again.");
    }, TIMEOUT_LIMIT);
}

// Reset timer whenever user interacts
function resetSessionTimer() {
    if (!isAuthenticated()) {
        endSession("Your session has ended. Please log in again.");
        return;
    }
    startSessionTimer();
}

// Protect page immediately
(function () {
    if (!isAuthenticated()) {
        // If they land on a protected page and aren't logged in at all, 
        // redirect silently without a disruptive alert.
        endSession(""); 
        return;
    }

    startSessionTimer();

    [
        "click",
        "mousemove",
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "touchmove"
    ].forEach(event => {
        document.addEventListener(event, resetSessionTimer, true);
    });

    // Cross-tab sync: Check every 5 seconds if token/session was cleared elsewhere
    setInterval(() => {
        if (!isAuthenticated()) {
            endSession("Your session has ended. Please log in again.");
        }
    }, 5000);
})();