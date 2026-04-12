function showTab(tabId) {
    document.querySelectorAll(".tab").forEach(btn => {
        btn.classList.remove("active");
    });

    document.querySelectorAll(".tab-items").forEach(tab => {
        tab.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");

    event.target.classList.add("active")
}