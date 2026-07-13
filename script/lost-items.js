// Local cache array to store the fetched items payload
let lostItemsCache = [];
const API_URL = "https://ooulostandfoundportal.onrender.com";

// ===================================================
// AUTH TOKEN
// ===================================================
function getSessionToken() {
    let token = localStorage.getItem("token");

    if (!token && localStorage.getItem("cuser")) {
        const parsedUser = JSON.parse(localStorage.getItem("cuser"));
        token = parsedUser.token || parsedUser.accessToken;
    }

    return token;
}

// ===================================================
// FETCH LOST ITEMS
// ===================================================
async function fetchAndDisplayLostItems() {
    const container = document.querySelector("#lostItemsContainer");
    const token = getSessionToken();

    if (!token) {
        container.innerHTML =
            `<p style="color:red;text-align:center;width:100%;">
                Authentication required. Please log in.
            </p>`;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/user/lost-items`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        const itemsList = result.data || result.items || result;

        if (!Array.isArray(itemsList)) {
            container.innerHTML =
                `<p style="color:orange;text-align:center;">
                    Invalid response from server.
                </p>`;
            return;
        }

        lostItemsCache = itemsList;
        container.innerHTML = "";

        itemsList.forEach((item, index) => {
            const itemImg = item.imgUrl || "../images/Laptop.png";
            const itemName = item.name || item.itemName || "Unnamed Item";
            const finderName = item.founderName || item.reporterName || "Anonymous";
            const status = item.status || "Available";
            const idString = item._id || index.toString();

            const card = document.createElement("div");
            card.className = "items-box-item";

            card.innerHTML = `
                <div class="items-details">
                    <div class="item-img">
                        <img src="${itemImg}" alt="${itemName}">
                        <p class="status ${status.toLowerCase()}">${status}</p>
                    </div>

                    <h2>${itemName}</h2>
                    <span>${finderName}</span>
                </div>

                <button
                    onclick="viewItemDetails('${idString}')"
                    class="open-btn">
                    View Details
                </button>

                <button
                    class="view-btn"
                    data-item-id="${idString}"
                    onclick="openRequestModal('${idString}')">
                    <i class="fa-solid fa-check"></i>
                    Request
                </button>
            `;

            container.appendChild(card);
        });

        if (itemsList.length === 0) {
            container.innerHTML =
                `<p style="text-align:center;color:gray;">
                    No reported items found.
                </p>`;
        }

    } catch (error) {
        console.error(error);
        container.innerHTML =
            `<p style="color:red;text-align:center;">
                Unable to connect to server.
            </p>`;
    }
}

// ===================================================
// VIEW DETAILS
// ===================================================
function viewItemDetails(identifier) {
    const item = lostItemsCache.find(
        (u, index) => u._id === identifier || index.toString() === identifier
    );

    if (!item) return;

    document.getElementById("sheetItemName").innerText = item.name || item.itemName || "N/A";
    document.getElementById("sheetCategory").innerText = item.category || "N/A";
    document.getElementById("sheetDate").innerText = item.dateFound || item.createdAt || "N/A";
    document.getElementById("sheetLocation").innerText = item.locationFound || item.location || "N/A";
    document.getElementById("sheetDescription").innerText = item.description || "No description.";

    openSheet();
}

function openSheet() {
    document.getElementById("bottomSheet").classList.add("active");
    document.getElementById("overlay").style.display = "block";
}

function closeSheet() {
    document.getElementById("bottomSheet").classList.remove("active");
    document.getElementById("overlay").style.display = "none";
}

// ===================================================
// CLAIM MODAL
// ===================================================
window.openRequestModal = function (itemId) {
    document.getElementById("modalItemId").value = itemId;
    document.getElementById("proofModal").style.display = "block";
};

window.closeModal = function () {
    document.getElementById("proofModal").style.display = "none";
    document.getElementById("proofForm").reset();
};

// ===================================================
// SUBMIT CLAIM
// ===================================================
async function submitProof(e) {
    e.preventDefault();

    const token = getSessionToken();

    if (!token) {
        alert("Please login.");
        window.location = './login.html';
        return;
    }

    // 1. Get the form inputs
    const modalItemIdInput = document.getElementById('modalItemId');
    const descriptionInput = document.getElementById('proofDescription');
    const additionalInput = document.getElementById('proofAdditional');
    const placeholderFile = "https://placehold.co/600x400?text=No+Image+Provided";
    
    const submitBtn = document.querySelector("#proofForm button[type='submit']");
    const itemId = modalItemIdInput.value;

    // 2. FIND THE ACTUAL ITEM DETAILS FROM YOUR LOCAL CACHE ARRAY
    const matchedItem = lostItemsCache.find(item => item._id === itemId);
    const actualItemName = matchedItem ? (matchedItem.name || matchedItem.itemName) : "Unknown Item";

    // 3. EXTRACT THE LOGGED IN USER'S REAL ACCOUNT NAME FROM LOCALSTORAGE
    let actualClaimerName = "Registered User";
    if (localStorage.getItem("cuser")) {
        const parsedUser = JSON.parse(localStorage.getItem("cuser"));
        // Grabs whatever name parameter your user profile object uses
        actualClaimerName = parsedUser.name || parsedUser.username || parsedUser.fullName || "Registered User";
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        const response = await fetch(`${API_URL}/user/claim-item`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                itemId: itemId,
                itemName: actualItemName,       // Now explicitly passing the Item Name!
                claimerName: actualClaimerName, // Now explicitly passing the User Name!
                description: descriptionInput.value,
                file: placeholderFile, 
                additional: additionalInput.value
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Submission failed.");
        }

        alert(result.message || "Proof submitted successfully.");

        const btn = document.querySelector(`button[data-item-id="${itemId}"]`);
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-clock"></i> Pending Verification`;
            btn.disabled = true;
            btn.style.background = "#888";
            btn.style.cursor = "not-allowed";
        }

        closeModal();

    } catch (err) {
        console.error(err);
        alert(err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Proof";
    }
}