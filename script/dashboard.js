// Check if the user is logged in
const user = JSON.parse(localStorage.getItem("cuser"));

if (!user) {
    alert("Please login first.");
    window.location.replace("./login.html");
}

// Display user's name
const nameElem = document.getElementById("name");
if (nameElem && user.name) {
    const names = user.name.split(" ");
    nameElem.textContent = names.length > 1 ? names[1] : names[0];
}

// Display user's profile image
const imgElem = document.getElementById("img");
if (imgElem && user.imgUrl) {
    imgElem.src = user.imgUrl;
}

// Logout function
function logout(e) {
    e.preventDefault();

    localStorage.removeItem("cuser");

    alert("Logged out successfully.");

    window.location.replace("./login.html");
}

// Logout buttons
const logoutBtn = document.getElementById("logoutBtn");
const sidebarLogout = document.getElementById("sidebarLogout");

if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
}

if (sidebarLogout) {
    sidebarLogout.addEventListener("click", logout);
}