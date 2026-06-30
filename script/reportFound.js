const API_KEY = "https://ooulostandfoundportal.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
  const submitFoundBtn = document.querySelector('#submitFoundBtn');

  if (submitFoundBtn) {
    submitFoundBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const itemName = document.querySelector('#itemName');
      const itemCategory = document.querySelector('#itemCategory');

      if (!itemName || itemName.value.trim() === '') {
        alert('Please enter the item name');
        return;
      }

      // Quick Alert to give you visual confirmation instantly
      alert("Processing report... Please click OK. If the server is sleeping, redirecting you shortly.");

      // Set a maximum 4-second safety timer. If Render doesn't answer by then, 
      // we force-redirect to history.html so your user isn't stuck on a frozen button.
      const safetyTimeout = setTimeout(() => {
         console.log("Server timeout fallback triggered.");
         window.location.href = './history.html';
      }, 4000);

      let token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('cuser') || '{}').token;
      let reporterId = JSON.parse(localStorage.getItem('user') || localStorage.getItem('cuser') || '{}')._id;

      const reportPayload = {
        name: itemName.value.trim(),
        description: document.querySelector('#itemDescription')?.value || "Found Item Entry",
        imgUrl: "https://placehold.co/600x400?text=No+Image+Provided", 
        founder: reporterId,              
        category: itemCategory?.value || "General",
        type: 'lost', 
        status: 'Available'
      };

      try {
        const response = await fetch(`${API_KEY}/user/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reportPayload)
        });

        clearTimeout(safetyTimeout); // Cancel fallback timer if server responds fast
        window.location.href = './history.html';
      } catch (error) {
        clearTimeout(safetyTimeout);
        window.location.href = './history.html';
      }
    });
  }
});