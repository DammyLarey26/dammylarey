// Use this inside your verify-claims.js
async function loadClaims() {
    const container = document.getElementById('claimsContainer');
    if (!container) return;

    try {
        const response = await fetch('https://ooulostandfoundportal.onrender.com/admin/claim-request');
        
        // Ensure the response is actually JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned non-JSON response (possibly an error page)");
        }

        const result = await response.json();
        const claims = result.data || [];

        if (claims.length === 0) {
            container.innerHTML = "<p style='text-align:center; padding:20px;'>No pending claims found in the database.</p>";
            return;
        }

        // Render if data exists
        container.innerHTML = claims.map(claim => `...`).join('');

    } catch (error) {
        console.error("Critical Render Error:", error);
        container.innerHTML = `<p style='color:red; text-align:center;'>Check console for details: ${error.message}</p>`;
    }
}