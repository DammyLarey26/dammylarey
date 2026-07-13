function openModal() {
  document.getElementById("proofModal").style.display = "block";
}

function closeModal() {
  document.getElementById("proofModal").style.display = "none";
}

const modalItemIdInput = document.getElementById('modalItemId');
const descriptionInput = document.getElementById('proofDescription');
const fileInput = document.getElementById('proofFile');
const additionalInput = document.getElementById('proofAdditional');

document.getElementById('proofForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // const formData = new FormData();
    // formData.append('itemId', document.getElementById('modalItemId').value);
    // formData.append('description', document.getElementById('proofDescription').value);
    // formData.append('file', document.getElementById('proofFile').files[0]);
    // formData.append('additional', document.getElementById('proofAdditional').value);

    if(!modalItemIdInput.value || !descriptionInput.value || !additionalInput.value) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        // REPLACE THE URL BELOW WITH THE EXACT ROUTE FOUND IN YOUR BACKEND
        const response = await fetch('https://ooulostandfoundportal.onrender.com/user/claim-item', {
            method: 'POST',
            body: {
                itemId: modalItemIdInput.value,
                description: descriptionInput.value,
                file: "https://placehold.co/600x400?text=No+Image+Provided",
                additional: additionalInput.value
            }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const result = await response.json();
        alert("Success: " + result.message);
        // window.location.href = '/admin/verify-claim.html';
    } catch (error) {
        console.error("Submission failed:", error);
        alert("Submission failed. Check Console (F12) for details.");
    }
});