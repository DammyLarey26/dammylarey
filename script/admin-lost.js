document.addEventListener('DOMContentLoaded', loadLostItems);

async function loadLostItems() {
    const container = document.getElementById('lostItemsContainer');
    
    // Show loading indicator
    if (container) container.innerHTML = "<p>Loading lost items...</p>";
    
    try {
        // Fetching from the specified path
        const response = await fetch('https://ooulostandfoundportal.onrender.com/user/lost-items');
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        // Adjust 'result.data' if your backend returns the array under a different key
        const items = result.data || [];

        if (items.length === 0) {
            if (container) container.innerHTML = "<p>No lost items currently found in the system.</p>";
            return;
        }

        // Render the items
        container.innerHTML = items.map(item => `
    <div class="item-card">
        ${item.fileUrl ? `<img src="${item.fileUrl}" alt="${item.itemName}">` : ""}
        <h3>${item.itemName || "Unnamed Item"}</h3>
        <p><strong>Description:</strong> ${item.description || "No description"}</p>
        <p><strong>Location:</strong> ${item.location || "N/A"}</p>
    </div>
`).join('');

    } catch (error) {
        console.error("Fetch Error:", error);
        if (container) {
            container.innerHTML = `<p style='color:red;'>Error loading items: ${error.message}</p>`;
        }
    }
}