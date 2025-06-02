const socket = io({
	auth: {
		cookie: document.cookie
	}
});
let ul = document.getElementById('messages');
let form = document.getElementById('form');
form.addEventListener('submit', function(e){
	e.preventDefault();
	if(input.value) {
		socket.emit('new_message', input.value);
		input.value = '';
	}
})
socket.on('message', (text) =>{
	let user_icon = document.createElement("div");
	user_icon.classList.add("user_content");
	user_icon.innerHTML = `<div class="user_icon">
						   <img src="${text.avatar}"></div><li><b>${text.user}:</b> <p>${text.content}</p></li>`;
	ul.append(user_icon);
	window.scrollTo(0, document.body.scrollHeight);
});
socket.on('get_chat', (message) =>{
	message.forEach(m => {
		let user_icon = document.createElement("div");
		user_icon.classList.add("user_content");
	user_icon.innerHTML = `<div class="user_icon">
						   <img src="${m.avatar}"></div><li><b>${m.login}:</b> <p>${m.content}</p></li>`;
	ul.append(user_icon);
	})
})
function Leave(){
	document.cookie = 'token=; Max-age=0';
	window.location.assign('/login');
}
