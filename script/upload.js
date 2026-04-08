const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");
const uploadContent = document.getElementById("uploadContent");

fileInput.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
            uploadContent.style.display = "none";
        };

        reader.readAsDataURL(file);
    }
});