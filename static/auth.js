let form_reg = document.getElementById("form_reg");
form_reg?.addEventListener('submit', async function(e){
	e.preventDefault();
	const {login, password, cnf_password, avatar} = form_reg;
	if(password.value == cnf_password.value) {
		const user = JSON.stringify({login: login.value, password: password.value, avatar: avatar.value});
		let fetch_zmin = await fetch('/api/register', {
 		 method: 'POST',
  		 body: user
});
	const caught_text = await fetch_zmin.text();
	alert(caught_text);
	if(caught_text == "User is successfully registrated") {
		window.location.assign('/login');
	}
	}
	else{
		alert("Wrong Password!");
	}
})


let form_log = document.getElementById("form_log");
const {login, password} = form_log;
form_log?.addEventListener('submit', async function(e){
	e.preventDefault();
	const {login, password} = form_log;
	if(login.value != "" && password.value != "") {
		const user = JSON.stringify({login: login.value, password: password.value});
		let fetch_zmin = await fetch('/api/login', {
 		 method: 'POST',
  		 body: user
});
	const token = await fetch_zmin.text();
	if(fetch_zmin.ok) {
		document.cookie = `token=${token}`;
		window.location.assign('/');
	}
	else{
		return alert(token);
	}
	}
	else{
		alert("Imput Is Empty!");
	}
})
function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.src = "https://img.icons8.com/ios-filled/50/000000/visible.png";
    } else {
      passwordInput.type = "password";
      eyeIcon.src = "https://img.icons8.com/ios-filled/50/000000/closed-eye.png";
    }
  }
 let wrapper = document.getElementById("window_wrapper");
 function modalWindow() {
  let wrapper = document.getElementById("window_wrapper")
 	if(wrapper.style.display =='flex') {
 		wrapper.style.display = 'none'
 	}
 	else{
 		wrapper.style.display = 'flex'
 	}
 }
 function closeModalWindow() {
 	let wrapper = document.getElementById("window_wrapper")
 	wrapper.style.display = 'none';
 }
 function pickIcon(img) {
 	document.getElementById("avatar").value = img;
  let wrapper = document.getElementById("window_wrapper");
  closeModalWindow();
 }
