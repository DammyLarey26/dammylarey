import { renderImgPrev } from "./utils/upload.js";

const API_KEY = "https://ooulostandfoundportal.onrender.com"
// const API_KEY = "http://localhost:5030" 

const uname = document.querySelector('#name');
const email = document.querySelector('#email')
const department = document.querySelector('#department')
const matric = document.querySelector('#matric');
const level = document.querySelector('#level');
const address = document.querySelector('#address')
const phone = document.querySelector('#phone')
const faculty = document.querySelector('#faculty')
const password = document.querySelector('#password')

function getGender() {
  const radios = document.querySelectorAll('input[name="gender"]');
  let selectedValue = 'Not Specified';

  radios.forEach(radio => {
    if (radio.checked) {
      selectedValue = radio.value;
    }
  });

  if (selectedValue) {
    return selectedValue;
  }
}

function register() {
  try {
    if (level.value == '') {
      alert('pick ur level')
      return;
    }

    const newUser = {
      name: uname.value,
      email: email.value,
      password: password.value,
      faculty: faculty.value,
      department: department.value,
      gender: getGender(),
      matric: matric.value.toUpperCase(),
      level: level.value,
      address: address.value,
      phone: phone.value,
      imgUrl: 'https://officialpurpled.github.io/online-voting-system/images/avatar.jpg'
    }

    fetch(`${API_KEY}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
    .then(res => res.json())
    .then((data) => {
      if (data.status !== 200){
        alert(data.message)
        return
      }

      localStorage.setItem('cuser', JSON.stringify(data.profile))

      window.location.href = './dashboard.html'
    })
  } catch (err) {
    alert('Unknown Error \n Please try again')
    console.error(err)
  }
}

document.querySelector('#signupBtn').addEventListener('click', () => {
  register();
})
