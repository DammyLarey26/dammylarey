const showLogin = document.querySelectorAll('#js-show');
const hideLogin = document.querySelector("#js-close");
const modal = document.querySelector('.modal');

export function displayLogin(status) {
  if (status) {
    modal.classList.add('active');
  } else {
    modal.classList.remove('active');
  }
}

showLogin.forEach(button => {
  button.addEventListener('click', () => {
    displayLogin(true);
  });
});

hideLogin.addEventListener('click', () => {
  displayLogin(false);
});

/* Close when clicking outside */
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    displayLogin(false);
  }
});

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", () => {
  loginBtn.classList.add("loading");

  // simulate API call
  setTimeout(() => {
    loginBtn.classList.remove("loading");
  }, 2000);
});