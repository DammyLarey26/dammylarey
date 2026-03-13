let faq = document.querySelectorAll(".faq-item");

faq.forEach(item => {
item.addEventListener("click", () => {

item.classList.toggle("active");

});
});