const uname = document.querySelector('.name');
const email = document.querySelector('.email')
const p = document.querySelector('.password')
const cp =document.querySelector('.cpassword')
// const inp = document.querySelectorAll('.input-field')

function register() {
  try {
    if (p.value !== cp.value){
      alert('password unmatch')
      return;
    }

    const data = {
      uname : uname.value,
      email : email.value,
      password : p.value
    }

    // console.log(data);
    sessionStorage.setItem('tempData', JSON.stringify(data))
    
  } catch (error) {
    alert('Internal Server Error\nPlease ty again')
  }
  window.location.href = 'cont-reg.html'
}

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  register();
})