const nameElem = document.querySelector('#name');
const imgElem = document.querySelector('#img');

const user = JSON.parse(localStorage.getItem('cuser'))

nameElem.innerText = user.name.split(' ')[1]
imgElem.src = user.imgUrl
