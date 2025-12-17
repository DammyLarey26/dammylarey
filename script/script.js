import {users} from "../data/user.js";

const showLogin =  document.querySelector('.js-show')
const hideLogin =  document.querySelector(".js-close")

let isActive = false;

function displayLogin(param) {
  if (!isActive) {
    document.querySelector('.modal').style.display = 'block'
    isActive = param
    console.log('login display : ' + isActive)
  } else {
    document.querySelector('.modal').style.display = 'none'
    isActive = param
    console.log('login display : ' + isActive)
  }
}

showLogin.addEventListener('click', ()=>{
  displayLogin(true);
})
// function openLogin() {
  //   document.getElementById("loginModal").style.display = "block";
  // }

hideLogin.addEventListener('click', ()=>{
  displayLogin(false)
})
// function closeLogin() {
//   document.getElementById("loginModal").style.display = "none";
// }
const userName = document.querySelector('.showname')
const intro = document.querySelector('.showintro')

function login() {
  const username = document.querySelector('.username').value.slice()
  const password = document.querySelector('.password').value.slice()

  // let html = '';

  let matchedUser;

  users.forEach(user => {
    if (user.password == password && user.username == username) {
      matchedUser = user
      return
    }
    // console.log(`Username: ${user.username}, Password: ${user.password}`);
  }); 

  if (matchedUser) {
    document.querySelector('.modal').style.display = 'none'
    displayLogin(false)

    userName.innerHTML = `Welcome, ${matchedUser.username}`
    intro.innerHTML = 'Here you will find all your lost item'

    localStorage.setItem('mainuser', JSON.stringify(matchedUser))
  } else {
    alert('user not found')
  }

  //const user = JSON.parse(localStorage.getItem('mainuser'))
  // const username =  user.username || '{user.name}';
}

document.querySelector('.js-loginBtn').addEventListener('click', ()=>{
  login()
})
