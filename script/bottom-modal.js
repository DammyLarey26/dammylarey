function openSheet() {
  document.getElementById("bottomSheet").classList.add("active");
  document.getElementById("overlay").classList.add("active");
}

function closeSheet() {
  document.getElementById("bottomSheet").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}
