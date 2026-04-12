const user = JSON.parse(localStorage.getItem('cuser'));

const userDetails = document.querySelector('#profile-box');

userDetails.innerHTML = `
  <div class="passport dar">
    <img src="${user.imgUrl}" alt="">
  </div>
  <div class="det">
    <span>👨‍🎓 ${user.name}</span>
    <span style="font-size: 11px; color: red;">🔐 *Password can not be displayed in an html element </span>
    <span>💼 ${user.faculty.toUpperCase()[0] + user.faculty.slice(1)}</span>
    <span>📞 ${user.phone}</span>
    <span>📩 ${user.email}</span>
    <div class="det-btn">
      <button>🖍 Edit Profile</button>
      <button>⚙ Change Password</button>
    </div>
  </div>
`;