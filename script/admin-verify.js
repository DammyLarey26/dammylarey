// Load up your claims data once page structures register
async function fetchAdminPendingClaims() {
    const container = document.querySelector('#claimsWrapperContainer');
    const token = localStorage.getItem('token');

    if (!token) {
        if (container) container.innerHTML = `<p style="color: red; text-align: center;">Session lost. Please re-authenticate.</p>`;
        return;
    }

    try {
        // Adjust endpoint URL if your backend route structure for listing claims differs slightly
        const response = await fetch('https://ooulostandfoundportal.onrender.com/admin/get-claims', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        const claimsList = result.data || result.claims || result;

        if (Array.isArray(claimsList)) {
            container.innerHTML = ''; // Clear loading notification

            if (claimsList.length === 0) {
                container.innerHTML = `<p style="text-align: center; color: gray; padding: 20px;">No pending verification claims at the moment.</p>`;
                return;
            }

            claimsList.forEach(claim => {
                const itemName = claim.itemName || (claim.item && claim.item.name) || "Item Verification Request";
                const claimId = claim._id;
                const description = claim.description || "No description provided.";
                const receiptImg = claim.receiptUrl || claim.imgUrl || "https://placehold.co/60";
                const additionalInfo = claim.additionalInfo || "None provided.";

                // Generate clean, semantic HTML block components
                const mainItem = document.createElement('main');
                mainItem.className = 'user';
                mainItem.innerHTML = `
                    <div class="faq-container">
                      <div class="faq-item">
                        <div class="faq-question" onclick="toggleAccordionElement(this)">
                          <h>${itemName}</h>
                          <p></p>
                          <i class="fa-solid fa-chevron-down"></i>
                        </div>

                        <div class="faq-answer" style="display: none;">
                          <h2>Proof of Ownership</h2>
                          <div class="itembox dare">
                            <div class="itembox-proof">
                              <div class="itembox-proof-items">
                                <h3>Description</h3>
                                <p>${description}</p>
                              </div>
                              <div class="itembox-proof-items">
                                <h3>Image/Receipt</h3>
                                <div class="img">
                                    <img src="${receiptImg}" alt="Receipt/Proof Image" style="max-width: 100px; max-height: 100px; border-radius: 4px; object-fit: cover; border: 1px solid #ccc;" onerror="this.style.display='none'">
                                </div>
                              </div>
                              <div class="itembox-proof-items">
                                <h3>Additional Information</h3>
                                <p>${additionalInfo}</p>
                              </div>
                            </div>
                            <div class="dare-btn">
                              <button class="reject" onclick="updateClaimStatus('${claimId}', 'rejected')">Reject</button>
                              <button class="accept" onclick="updateClaimStatus('${claimId}', 'approved')">Accept</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                `;
                container.appendChild(mainItem);
            });
        }
    } catch (error) {
        console.error("Claims loading breakdown:", error);
        if (container) container.innerHTML = `<p style="color: red; text-align: center;">Error synchronization error with system database link.</p>`;
    }
}

// ==========================================
// ACCORDION DRIVEN INTERFACE ENGINE
// ==========================================
function toggleAccordionElement(element) {
    const answerPanel = element.nextElementSibling;
    const icon = element.querySelector('i');
    
    if (answerPanel.style.display === "block" || answerPanel.style.display === "") {
        answerPanel.style.display = "none";
        if (icon) icon.className = "fa-solid fa-chevron-down";
    } else {
        answerPanel.style.display = "block";
        if (icon) icon.className = "fa-solid fa-chevron-up";
    }
}

// ==========================================
// PATCH API ACTIONS FOR ACCEPT / REJECT
// ==========================================
async function updateClaimStatus(claimId, statusDecision) {
    const token = localStorage.getItem('token');
    
    if (!confirm(`Are you sure you want to mark this claim as ${statusDecision}?`)) {
        return;
    }

    try {
        const response = await fetch('https://ooulostandfoundportal.onrender.com/admin/verify-claim', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                claimId: claimId,
                status: statusDecision // Sends either 'approved' or 'rejected' depending on the button pressed
            })
        });

        const result = await response.json();

        if (response.ok || result.success) {
            alert(`Claim successfully ${statusDecision}!`);
            // Refresh dashboard data matrix instantly without hard-reloading page asset maps
            fetchAdminPendingClaims();
        } else {
            alert(`Process update failure: ${result.message || 'System verification rejected action'}`);
        }
    } catch (error) {
        console.error("PATCH validation processing error:", error);
        alert("Server failed to respond to decision sequence pipeline.");
    }
}

// Fire dynamic population sequence instantly
document.addEventListener('DOMContentLoaded', fetchAdminPendingClaims);