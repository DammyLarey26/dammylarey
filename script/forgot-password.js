const API_KEY = "https://ooulostandfoundportal.onrender.com";
// const API_KEY = "http://localhost:5030";

async function forgetPassword() {
  const email = document.querySelector('#email');
  const newPassword = document.querySelector('#newPassword');
  const resetBtn = document.querySelector('#resetBtn');
  const btnText = document.querySelector('.btn-text');
  const resetMsg = document.querySelector('#resetMsg');

  try {
    // 🌀 start loading
    resetBtn.classList.add("loading");
    resetBtn.disabled = true;
    btnText.textContent = "Resetting...";

    // clear old message
    resetMsg.textContent = "";
    resetMsg.className = "login-msg";

    if (email.value.trim() === "" || newPassword.value.trim() === "") {
      resetMsg.textContent = "All fields are required";
      resetMsg.classList.add("error");

      // stop loading
      resetBtn.classList.remove("loading");
      resetBtn.disabled = false;
      btnText.textContent = "Reset Password";
      return;
    }

    const response = await fetch(`${API_KEY}/auth/forget-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email.value,
        newPassword: newPassword.value
      })
    });

    const data = await response.json();

    if (!data.success) {
      resetMsg.textContent = data.message || "Something went wrong";
      resetMsg.classList.add("error");

      resetBtn.classList.remove("loading");
      resetBtn.disabled = false;
      btnText.textContent = "Reset Password";
      return;
    }

    // 🟢 success
    resetMsg.textContent = "Password changed successfully!";
    resetMsg.classList.add("success");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);

  } catch (err) {
    console.error(err);

    resetMsg.textContent = "Unknown error. Please try again.";
    resetMsg.classList.add("error");

  } finally {
    // stop loading in all cases
    resetBtn.classList.remove("loading");
    resetBtn.disabled = false;
    btnText.textContent = "Reset Password";
  }
}

document.querySelector('#resetBtn').addEventListener('click', forgetPassword);