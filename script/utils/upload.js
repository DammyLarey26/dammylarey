const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");
const uploadContent = document.getElementById("uploadContent");

export function renderImgPrev() {
	fileInput.addEventListener("change", function () {
		const file = this.files[0];
	
		if (file) {
			const reader = new FileReader();
			const imgUrl = `images/${file.name}`;
	
			reader.onload = function (e) {
				previewImage.src = e.target.result;
				// imgUrl = e.target.result
				previewImage.style.display = "block";
				uploadContent.style.display = "none";
			};
	
			reader.readAsDataURL(file);
			console.log(imgUrl)
		}
	});	
}

renderImgPrev()