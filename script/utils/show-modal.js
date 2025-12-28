const showLogin =  document.querySelector('.js-show')
const hideLogin =  document.querySelector(".js-close")

let isActive = false;

export function displayLogin(param) {
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