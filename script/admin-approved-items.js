async function loadApprovedItems() {

    const itemsContainer = document.querySelector("#lostItemsContainer");
    const loading = document.querySelector("#loading");
    const emptyState = document.querySelector("#emptyState");
    const searchInput = document.querySelector("#searchInput");

    let allItems = [];

    try {
        if (loading) loading.style.display = "block";
        if (itemsContainer) itemsContainer.innerHTML = "";
        if (emptyState) emptyState.style.display = "none";

        // Using the updated found-items admin endpoint
        const response = await fetch(
            "https://ooulostandfoundportal.onrender.com/admin/found-items"
        );

        const result = await response.json();

        if (loading) loading.style.display = "none";

        if (!response.ok) {
            throw new Error(result.message || "Unable to fetch approved items.");
        }

        // Extracts items from the result's data property matching the JSON structure
        const rawItems = result.data || [];

        // Filter items matching approval status states (e.g., claimed)
        allItems = rawItems.filter(item => {
            const status = (item.status || "").toLowerCase();
            return status === "approved" || status === "claimed" || status === "resolved";
        });

        displayItems(allItems);

    } catch (error) {
        console.error(error);
        if (loading) loading.style.display = "none";

        if (emptyState) {
            emptyState.style.display = "block";
            emptyState.innerHTML = error.message;
        }
    }

    function displayItems(items) {
        itemsContainer.innerHTML = "";

        if (!items.length) {
            emptyState.style.display = "block";
            emptyState.innerHTML = "No Approved Items Found.";
            return;
        }

        emptyState.style.display = "none";

        items.forEach(item => {
            // Mapped directly according to the provided JSON structure
            const image = item.imgUrl || "../images/Laptop.png";
            const itemName = item.name || "Unnamed Item";
            const description = item.description || "No description";
            const location = item.foundLocation || "N/A";
            const dateFound = item.foundDate || item.createdAt;
            
            // Extract nesting from the founder object securely
            const founder = item.founder || {};
            const reporter = founder.name || "Unknown Reporter";
            const matric = founder.matric ? ` (${founder.matric})` : "";
            const status = item.status || "Approved";
            const id = item._id || "N/A";

            // Visual badge coloring setup for the approval state
            let statusColor = "#5cb85c"; // green for claimed/approved
            if (status.toLowerCase() === "claimed") {
                statusColor = "#2e7d32"; // Darker shade green for successfully claimed items
            }

            itemsContainer.innerHTML += `
            <div class="user-box-item">
                <div class="user-details">
                    <div class="user-img">
                        <img src="${image}" alt="${itemName}">
                    </div>

                    <div class="user-det">
                        <h3>${itemName}</h3>

                        <span><strong>Reference:</strong>&nbsp;${id}</span>
                        <span><strong>Description:</strong>&nbsp;${description}</span>
                        <span><strong>Location Found:</strong>&nbsp;${location}</span>
                        <span><strong>Date Found:</strong>&nbsp;${
                            dateFound ? new Date(dateFound).toLocaleDateString() : "N/A"
                        }</span>

                        <span>
                            <strong>Status:</strong>&nbsp;
                            <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">
                                ${status}
                            </span>
                        </span>

                        <br>
                        <span><strong>Founder:</strong>&nbsp;${reporter}${matric}</span>
                    </div>
                </div>
            </div>
            `;
        });
    }

    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            const keyword = this.value.toLowerCase();

            const filtered = allItems.filter(item => {
                const founder = item.founder || {};
                
                return (
                    (item.name || "").toLowerCase().includes(keyword) ||
                    (item.foundLocation || "").toLowerCase().includes(keyword) ||
                    (item.description || "").toLowerCase().includes(keyword) ||
                    (founder.name || "").toLowerCase().includes(keyword) ||
                    (founder.email || "").toLowerCase().includes(keyword) ||
                    (founder.matric || "").toLowerCase().includes(keyword) ||
                    String(item._id || "").toLowerCase().includes(keyword)
                );
            });

            displayItems(filtered);
        });
    }
}

document.addEventListener("DOMContentLoaded", loadApprovedItems);