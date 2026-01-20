const uname = document.querySelector('.name');
const email = document.querySelector('.email')
const department = document.querySelector('.department')
const genders = document.querySelector('.radii')
const matric = document.querySelector('.matric');
const level = document.querySelector('.level');
const address = document.querySelector('.address')
const phone =document.querySelector('.phone')


const tempData = JSON.parse(sessionStorage.getItem('tempData'))

uname.value = tempData.uname
email.value = tempData.email

function register() {
  try {
    if (level.value == ''){
      alert('pick ur level')
      return;
    }

    const data = {
      fullname : uname.value,
      email : email.value,
      password : tempData.password,
      department : department.value,
      gender : 'Male' || 'Female',
      matric : matric.value,
      level : level.value,
      address : address.value,
      phone : phone.value
    }

    console.log(data);
    localStorageStorage.setItem('mainuser', JSON.stringify(data))
    
  } catch (error) {
    alert('Internal Server Error\nPlease ty again')
  }
  window.location.href = 'profile.html'
}

document.querySelector('.submit').addEventListener('click', () => {
  register();
})