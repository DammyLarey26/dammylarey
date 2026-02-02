const user = JSON.parse(localStorage.getItem('mainuser'));

const userDetails = document.querySelector('.user-details');
const abstractInfo = document.querySelector('.abstract-info');

document.querySelectorAll('#user-img img').forEach(img => {
  img.src = user.userImg;
  img.alt = user.fullname.split(' ')[1] + '-Profile Image';
});

userDetails.innerHTML = `
  <p>${user.fullname.toUpperCase()}</p>
  <p>${user.matric.toUpperCase()}</p>
  <p>${user.faculty}</p>
  <p>${user.department}</p>
  <p>${user.level} Level</p>
  <p>${user.gender.toUpperCase()[0] + user.gender.slice(1)}</p>
  <p>${user.phone}</p>
  <p>${user.email}</p>
  <p>${user.address}</p>
`;

abstractInfo.innerHTML = `
  <p>${user.fullname.toUpperCase().split(' ')[1]}</p>
  <p>${user.matric.toUpperCase()}</p>
`;