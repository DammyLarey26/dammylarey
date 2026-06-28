//const nameElem = document.querySelector('#name'); 
//const imgElem = document.querySelector('#img'); 

//const user = JSON.parse(localStorage.getItem('cuser')) 

//nameElem.innerText = user.name.split(' ')[1] 
//imgElem.src = user.imgUrl
// ==========================================
// 1. GLOBAL LOGOUT HANDLER
// ==========================================
window.forceLogout = function(e) {
    if (e) e.preventDefault();

    const confirmLogout = confirm("Are you sure you want to log out?");
    
    if (confirmLogout) {
        sessionStorage.removeItem("loggedIn");
        sessionStorage.removeItem("welcomeShown"); // Reset welcome flag on logout
        localStorage.removeItem("cuser");
        window.location.replace('./login.html');
    }
};

// ==========================================
// 2. LOAD USER PROFILE & WELCOME ALERT
// ==========================================
const user = JSON.parse(localStorage.getItem('cuser'));

if (user) {
    const nameElem = document.querySelector('#name'); 
    const imgElem = document.querySelector('#img'); 

    // Grab the first word of the name safely
    const firstName = user.name ? user.name.split(' ')[0] : "User";

    if (nameElem) {
        nameElem.innerText = firstName; 
    }
    if (imgElem && user.imgUrl) {
        imgElem.src = user.imgUrl;
    }

    // Check what is currently stored in your browser console
    console.log("Welcome Alert Flag Status:", sessionStorage.getItem("showWelcomeAlert"));

    // 🎉 TRIGGER WELCOME ALERT
    if (sessionStorage.getItem("showWelcomeAlert") === "true") {
        alert("Welcome back, " + firstName + "! Glad to have you here.");
        sessionStorage.removeItem("showWelcomeAlert");
    }
} else {
    console.log("No user object found in localStorage");
}