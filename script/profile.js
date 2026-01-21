const user = JSON.parse(localStorage.getItem('mainuser'));

const userDetails = document.querySelector('.user-details');
const userImg = document.querySelector('#user-img');

userImg.innerHTML = `
  <img src="${user.userImg}" alt="user avatar">
`;
userDetails.innerHTML = `
  <p>${user.fullname.toUpperCase()}</p>
  <p>${user.matric.toUpperCase()}</p>
  <p>${user.faculty}</p>
  <p>${user.department}</p>s
  <p>${user.level} Level</p>
  <p>${user.gender}</p>
  <p>${user.phone}</p>
  <p>${user.email}</p>
  <p>${user.address}</p>
`;