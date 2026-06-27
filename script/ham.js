const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");
const navBar = document.getElementById("navBar");

menuBtn.addEventListener("click", () => {
    navBar.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    navBar.classList.remove("active");
});