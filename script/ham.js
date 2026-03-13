const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
    nav.classList.toggle("active");
});