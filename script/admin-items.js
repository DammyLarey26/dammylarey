async function loadLostItems() {

    // 🚀 BYPASS: Authentication deactivated
    const token = localStorage.getItem("token") || "GUEST_ACCESS_MODE";

    const itemsContainer = document.querySelector("#lostItemsContainer");
    const loading = document.querySelector("#loading");
    const emptyState = document.querySelector("#emptyState");
    const searchInput = document.querySelector("#searchInput");

    let allItems = [];

    try {

        if (loading) loading.style.display = "block";
        if (itemsContainer) itemsContainer.innerHTML = "";
        if (emptyState) emptyState.style.display = "none";

        const response = await fetch(
            "https://ooulostandfoundportal.onrender.com/user/lost-items",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        if (loading) loading.style.display = "none";

        if (!response.ok) {
            throw new Error(result.message || "Unable to fetch lost items.");
        }

        allItems = result.data || result.items || result || [];

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
            emptyState.innerHTML = "No Lost Items Found.";
            return;
        }

        emptyState.style.display = "none";

        items.forEach(item => {

            const image =
                item.imgUrl ||
                item.image ||
                "../images/Laptop.png";

            const itemName =
                item.itemName ||
                item.name ||
                "Unnamed Item";

            const category =
                item.category ||
                "N/A";

            const description =
                item.description ||
                "No description";

            const location =
                item.locationLost ||
                item.location ||
                "Unknown";

            const dateLost =
                item.dateLost ||
                item.createdAt;

            const reporter =
                item.user?.fullname ||
                item.fullname ||
                item.reporter ||
                "N/A";

            const email =
                item.user?.email ||
                item.email ||
                "N/A";

            const userId =
                item.user?._id ||
                item.user?.id ||
                item.userId ||
                item.user ||
                "N/A";

            const phone =
                item.user?.phone ||
                item.phone ||
                "N/A";

            const status =
                item.status ||
                "Pending";

            const id =
                item._id ||
                "";

            itemsContainer.innerHTML += `

            <div class="user-box-item">

                <div class="user-details">

                    <div class="user-img">
                        <img src="${image}" alt="${itemName}">
                    </div>

                    <div class="user-det">

                        <h3>${itemName}</h3>

                        <span><strong>Reference:</strong>&nbsp;${id}</span>

                        <span><strong>Category:</strong>&nbsp;${category}</span>

                        <span><strong>Description:</strong>&nbsp;${description}</span>

                        <span><strong>Location:</strong>&nbsp;${location}</span>

                        <span><strong>Date Lost:</strong>&nbsp;${
                            dateLost
                                ? new Date(dateLost).toLocaleString()
                                : "N/A"
                        }</span>

                        <span><strong>Status:</strong>&nbsp;${status}</span>

                        <br>

                        <span><strong>Reporter:</strong>&nbsp;${reporter}</span>

                        <span><strong>Email:</strong>&nbsp;${email}</span>

                        <span><strong>ID:</strong>&nbsp;${userId}</span>

                        <span><strong>Phone:</strong>&nbsp;${phone}</span>

                    </div>

                </div>

                <div class="user-det-btn">

                    <button
                        class="accept viewBtn"
                        data-id="${id}">
                        View Details
                    </button>

                </div>

            </div>

            `;

        });

    }

    if (searchInput) {

        searchInput.addEventListener("keyup", function () {

            const keyword = this.value.toLowerCase();

            const filtered = allItems.filter(item =>

                (item.itemName || item.name || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (item.category || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (item.locationLost || item.location || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (item.description || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (item.user?.fullname || item.fullname || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (item.user?.email || item.email || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(
                    item.user?._id ||
                    item.user?.id ||
                    item.userId ||
                    item.user ||
                    ""
                )
                    .toLowerCase()
                    .includes(keyword)

            );

            displayItems(filtered);

        });

    }

}

document.addEventListener("DOMContentLoaded", loadLostItems);