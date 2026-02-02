const uname = document.querySelector('.name');
const email = document.querySelector('.email')
const department = document.querySelector('.department')
const matric = document.querySelector('.matric');
const level = document.querySelector('.level');
const address = document.querySelector('.address')
const phone =document.querySelector('.phone')
const faculty = document.querySelector('.faculty')

const tempData = JSON.parse(sessionStorage.getItem('tempData'))

//stores the previous value in its field
uname.value = tempData.uname
email.value = tempData.email

function getGender () {
  const radios = document.querySelectorAll('input[name="gender"]'); 
  let selectedValue = null; 
  
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
    if (level.value == ''){
      alert('pick ur level')
      return;
    }

    const data = {
      fullname : uname.value,
      email : email.value,
      password : tempData.password,
      faculty : faculty.value,
      department : department.value,
      gender : getGender(),
      matric : matric.value,
      level : level.value,
      address : address.value,
      phone : phone.value,
      userImg: 'https://officialpurpledragon01.github.io/online-voting-system/images/avatar.jpg' || '../images/lekan.jpg'
    }
    // console.log(data);
    localStorage.setItem('mainuser', JSON.stringify(data))
    sessionStorage.removeItem('tempData')

    window.location.href = 'profile.html'

  } catch (err) {
    alert('Internal Server Error\nPlease ty again')
    console.error(err)
  }
}

document.querySelector('.submit').addEventListener('click', () => {
  register();
})