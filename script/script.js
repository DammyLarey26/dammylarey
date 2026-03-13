import {displayLogin} from "./utils/show-modal.js";

const userName = document.querySelector('.showname')
const intro = document.querySelector('.showintro')

sessionStorage.removeItem('tempData')

async function login() {
  try {
    const username = document.querySelector('.username').value.slice()
    const password = document.querySelector('.password').value.slice()
    
    const data =  await fetch('../data/user.json')
    const jsonData = await data.json()
    const users = jsonData.users
    
    const matchedUser = users.find(u => u.username === username && u.password === password);
   
    if (matchedUser) {
      document.querySelector('.modal').style.display = 'none'
      displayLogin(false)
  
      userName.innerHTML = `Welcome, ${matchedUser.username}`
      intro.innerHTML = 'Here you will find all your lost item'
  
      localStorage.setItem('mainuser', JSON.stringify(matchedUser))
    } else {
      alert('user not found')
    } 
  } catch (error) {
    alert('Internal Error \n Please try again')
    console.error('Error: ', error);
  }
}

document.querySelector('.js-loginBtn').addEventListener('click', ()=>{
  login()
})

