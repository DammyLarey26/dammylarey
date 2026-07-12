// Import the shared logic or place the handleReportSubmission function here
// If you keep it in a shared file, you can remove the function definition 
// and just call the function directly.

const API_KEY = "https://ooulostandfoundportal.onrender.com";

// --- CORE SUBMISSION LOGIC ---
async function handleReportSubmission(reportType) {
    const itemName = document.querySelector('#itemName');
    const itemCategory = document.querySelector('#itemCategory');
    const itemDate = document.querySelector('#dateFound');
    const itemLocation = document.querySelector('#locationFound');
    const itemDescription = document.querySelector('#itemDescription');

    // Basic Validation
    if (!itemName?.value || !itemCategory?.value) {
        alert('Please fill in the required fields.');
        return;
    }

    // Auth & Token logic
    let token = localStorage.getItem('token');
    if (!token && localStorage.getItem('cuser')) {
        const parsedUser = JSON.parse(localStorage.getItem('cuser'));
        token = parsedUser.token || parsedUser.accessToken;
    }

    const cachedUser = localStorage.getItem('user') || localStorage.getItem('cuser');
    const reporterId = cachedUser ? (JSON.parse(cachedUser)._id || JSON.parse(cachedUser).id) : null;

    // Payload construction specifically for 'found'
    const reportPayload = {
        name: itemName.value.trim(),
        description: itemDescription?.value || "No description provided.",
        imgUrl: "https://placehold.co/600x400?text=No+Image+Provided",
        founder: reporterId,
        foundLocation: itemLocation?.value || "Unknown Location",
        foundDate: itemDate?.value || new Date().toISOString().split('T')[0],
        category: itemCategory.value,
        type: reportType // This ensures it registers as 'found'
    };

    try {
        const response = await fetch(`${API_KEY}/user/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(reportPayload)
        });

        const data = await response.json();
        if (response.ok || data.success) {
            alert(`Item reported as ${reportType} successfully!`);
            window.location.href = './history.html'; // Redirect to your specific 'found' view
        } else {
            alert(data.message || "Submission rejected.");
        }
    } catch (error) {
        console.error("Submission error:", error);
    }
}

// --- INITIALIZE LISTENER ---
document.addEventListener('DOMContentLoaded', () => {
    const foundBtn = document.querySelector('#submitFoundBtn');
    if (foundBtn) {
        foundBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleReportSubmission('found'); // Explicitly sending 'found'
        });
    }
});