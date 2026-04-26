const API_KEY = "https://ooulostandfoundportal.onrender.com";
// const API_KEY = "http://localhost:5030";

async function forgetPassword() {
  const email = document.querySelector('#email');
  const newPassword = document.querySelector('#newPassword');
  const resetBtn = document.querySelector('#resetBtn');
  const btnText = document.querySelector('.btn-text');
  const resetMsg = document.querySelector('#resetMsg');

  // Helper: Validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper: Retry with exponential backoff
  async function fetchWithRetry(url, options, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout per attempt

        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);

        // Check for HTTP errors
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (err) {
        lastError = err;
        if (err.name === 'AbortError') {
          // Timeout - retry if attempts left
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          // Network error - retry if attempts left
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        // For other errors or max retries reached, throw
        throw lastError;
      }
    }
  }

  try {
    // 🌀 start loading
    resetBtn.classList.add("loading");
    resetBtn.disabled = true;
    btnText.textContent = "Resetting...";

    // clear old message
    resetMsg.textContent = "";
    resetMsg.className = "login-msg";

    const emailValue = email.value.trim();
    const passwordValue = newPassword.value.trim();

    if (emailValue === "" || passwordValue === "") {
      resetMsg.textContent = "All fields are required";
      resetMsg.classList.add("error");
      return;
    }

    if (!isValidEmail(emailValue)) {
      resetMsg.textContent = "Please enter a valid email address";
      resetMsg.classList.add("error");
      return;
    }

    if (passwordValue.length < 6) {
      resetMsg.textContent = "Password must be at least 6 characters long";
      resetMsg.classList.add("error");
      return;
    }

    const response = await fetchWithRetry(`${API_KEY}/auth/reset-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: emailValue,
        newPassword: passwordValue
      })
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      throw new Error("Invalid response from server");
    }

    if (!data.success) {
      resetMsg.textContent = data.message || "Something went wrong";
      resetMsg.classList.add("error");
      return;
    }

    // 🟢 success
    resetMsg.textContent = "Password changed successfully!";
    resetMsg.classList.add("success");

    setTimeout(() => {
      window.location.href = "./pages/login.html";
    }, 1500);

  } catch (err) {
    console.error(err);

    let errorMessage = "Unknown error. Please try again.";
    if (err.name === 'AbortError') {
      errorMessage = "Request timed out after retries. Please check your connection and try again.";
    } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
      errorMessage = "Network error after retries. Please check your internet connection.";
    } else if (err.message.includes('HTTP')) {
      errorMessage = `Server error: ${err.message}`;
    } else if (err.message === "Invalid response from server") {
      errorMessage = "Server returned an invalid response. Please try again later.";
    }

    resetMsg.textContent = errorMessage;
    resetMsg.classList.add("error");

  } finally {
    // stop loading in all cases
    resetBtn.classList.remove("loading");
    resetBtn.disabled = false;
    btnText.textContent = "Reset Password";
  }
}

function uforgetPassword() {
  const email = document.querySelector('#email');
  const newPassword = document.querySelector('#newPassword');
  // const resetBtn = document.querySelector('#resetBtn');
  try {
    fetch(`${API_KEY}/auth/reset-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email.value,
        newPassword: newPassword.value
      })
    })
      .then(res => res.json())
      .then(data => console.log(data))


    // 🟢 success
    // resetMsg.textContent = "Password changed successfully!";
    // resetMsg.classList.add("success");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  } catch (error) {
    console.log(error)
  }
}

document.querySelector('#resetBtn').addEventListener('click', forgetPassword);