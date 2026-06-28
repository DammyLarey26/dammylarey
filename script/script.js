const API_KEY = "https://ooulostandfoundportal.onrender.com"
// const API_KEY = "http://localhost:5030"  

async function login() {
  const email = document.querySelector('#email');
  const password = document.querySelector('#password');
  const loginBtn = document.querySelector('#loginBtn');

  try {
    // 🔄 Start spinner
    loginBtn.classList.add("loading");
    loginBtn.disabled = true;

    if (email.value.trim() === "" || password.value.trim() === "") {
      alert("All Field Is Required");

      // ❌ Stop spinner
      loginBtn.classList.remove("loading");
      loginBtn.disabled = false;
      return;
    }

    const response = await fetch(`${API_KEY}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

   const data = await response.json();

    // Checks both status 200 or a success flag from your backend
    if (data.status !== 200 && data.success !== true) {
      alert(data.message || "Login failed");

      // ❌ Stop spinner
      loginBtn.classList.remove("loading");
      loginBtn.disabled = false;
      return;
    }

    // 💾 SAVE THE AUTHENTICATION TOKEN
    if (data.token) {
        localStorage.setItem('token', data.token);
        sessionStorage.setItem("loggedIn", "true");
        
        alert("Login successfully!");
        window.location.href = './dashboard.html';
    } else {
        // Fallback warning if backend configuration changes unexpectedly
        alert("Login succeeded, but no authorization token was received.");
        console.log("Full backend response:", data);
        
        sessionStorage.setItem("loggedIn", "true");
        window.location.href = './dashboard.html';
    }

  } catch (err) {
    alert('Unknown Error \n Please try again');
    console.error(err);

    // ❌ Stop spinner
    loginBtn.classList.remove("loading");
    loginBtn.disabled = false;
  }
}

document.querySelector('#loginBtn').addEventListener('click', () => {
  login();
});