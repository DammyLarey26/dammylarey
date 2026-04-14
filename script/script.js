import { displayLogin } from "./utils/show-modal.js";

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

    if (data.status !== 200) {
      alert(data.message);

      // ❌ Stop spinner
      loginBtn.classList.remove("loading");
      loginBtn.disabled = false;
      return;
    }

    localStorage.setItem('cuser', JSON.stringify(data.profile));

    window.location.href = './pages/dashboard.html';

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