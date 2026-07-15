const API_URL = "https://ooulostandfoundportal.onrender.com";
const container = document.getElementById("claimsContainer");

// Get token
function getToken() {
    return (
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("admin") || "{}").token ||
        JSON.parse(localStorage.getItem("cuser") || "{}").token
    );
}

// FAQ Toggle
function initFaq() {
    document.querySelectorAll(".faq-item").forEach(item => {
        if (item.dataset.bound) return;
        item.dataset.bound = "true";

        item.addEventListener("click", (e) => {
            if (
                e.target.closest(".accept") ||
                e.target.closest(".reject")
            ) return;

            item.classList.toggle("active");
        });
    });
}

// Helper to show the empty message
function showEmptyMessage() {
    container.innerHTML = "<p>No pending claims.</p>";
}

// Load Claims
async function loadClaims() {
    container.innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch(`${API_URL}/admin/claim-request`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

        const {success, request, total} = await res.json();

<<<<<<< HEAD
        if (request.length === 0) {
            container.innerHTML = "<p>No claim requests found.</p>";
=======
        // Check if the API returned an error or if the data array is empty
        if (!result.success || !result.data || result.data.length === 0) {
            showEmptyMessage();
>>>>>>> e89017ed82e21e5029fe06a8dc63f5fba723f4e2
            return;
        }

        container.innerHTML = "";

<<<<<<< HEAD
        request.forEach(claim => {
            const item = claim.item
            const claimer = claim.claimer
=======
        result.data.forEach(claim => {
>>>>>>> e89017ed82e21e5029fe06a8dc63f5fba723f4e2
            const card = document.createElement("main");
            card.className = "user";

            card.innerHTML = `
                <div class="faq-container">
                    <div class="faq-item">
                        <div class="faq-question">
                            <h>Claim Request</h>
                            <p>${item.name}</p>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <h2>Proof of Ownership</h2>
                            <div class="itembox dare">
                                <div class="itembox-proof">
                                    <div class="itembox-proof-items">
                                        <h3>Description</h3>
                                        <p>${claim.description || "-"}</p>
                                    </div>
                                    <div class="itembox-proof-items">
                                        <h3>Image / Receipt</h3>
                                        <div class="img">
                                            <img src="${claim.proofImg}" style="width:100%;border-radius:8px;">
                                        </div>
                                    </div>
                                    <div class="itembox-proof-items">
                                        <h3>Additional Information</h3>
                                        <p>${claim.moreInfo || "-"}</p>
                                    </div>
                                </div>
                                <div class="dare-btn">
                                    <button class="reject">Reject</button>
                                    <button class="accept">Accept</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Accept
            card.querySelector(".accept").onclick = () =>
                verifyClaim(claim._id, "approved", card);

            // Reject
            card.querySelector(".reject").onclick = () =>
                verifyClaim(claim._id, "declined", card);

            container.appendChild(card);
        });

        initFaq();

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Unable to connect to server.</p>";
    }
}

// Verify Claim
async function verifyClaim(id, status, card) {
    try {
        const res = await fetch(`${API_URL}/admin/verify-claim`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                claimId: id,
                status
            })
        });

        const result = await res.json();

        if (res.ok) {
            alert(result.message || "Updated successfully.");
            
            // Remove the card from the UI
            card.remove();

            // Dynamic Check: If that was the last card, show the "No pending claims" message
            if (container.children.length === 0) {
                showEmptyMessage();
            }
        } else {
            alert(result.message || "Verification failed.");
        }
    } catch (err) {
        console.error(err);
        alert("Server error.");
    }
}

loadClaims();