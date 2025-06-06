const http = require('http');
const fs = require('fs');
const path = require ('path');
const {Server} = require ('socket.io');
const cookie = require ('cookie');
const tokens = [];

const pathToIndex = path.join(__dirname, 'static', 'chat.html');
const pathToStyle = path.join(__dirname, 'static', 'chat.css');
const pathToScript = path.join(__dirname, 'static', 'script.js');

const pathToRegIndex = path.join(__dirname, 'static', 'register.html');
const pathToRegStyle = path.join(__dirname, 'static', 'register.css');
const pathToAuthScript = path.join(__dirname, 'static', 'auth.js');

const pathToLogIndex = path.join(__dirname, 'static', 'login.html');

const db = require('./db');

const indexHtmlFile = fs.readFileSync(pathToIndex);
const indexCssFile = fs.readFileSync(pathToStyle);
const indexJsFile = fs.readFileSync(pathToScript);

const indexHtmlReglFile = fs.readFileSync(pathToRegIndex);
const indexCssRegFile = fs.readFileSync(pathToRegStyle);
const indexJsAuthFile = fs.readFileSync(pathToAuthScript);

const indexHtmlLoglFile = fs.readFileSync(pathToLogIndex);

const server = http.createServer((req, res) => {
	if (req.url == '/chat.css') {
		return res.end(indexCssFile);
	}
	else if (req.url == '/register') {
		return res.end(indexHtmlReglFile);
	}
	else if (req.url == '/register.css') {
		return res.end(indexCssRegFile);
	}
	else if (req.url == '/auth.js') {
		return res.end(indexJsAuthFile);
	}
	else if (req.url == '/login') {
		return res.end(indexHtmlLoglFile);
	}
	else if (req.url == '/api/register') {
		let data = '';
		req.on('data', function(chunk) {
			data += chunk;
		});
		req.on('end', async function(){
			console.log(data);
			let JSON_data = JSON.parse(data);
			if(JSON_data.login == "" || JSON_data.password == "") {
				return res.end("One of The Inputs Is Empty");
			}
			if(await db.userCheck(JSON_data.login)){
				return res.end("This Login Is Already Taken");
			}
			await db.addUser(JSON_data.login, JSON_data.password, JSON_data.avatar);
			res.end("User is successfully registrated");
		});
		return
	}

	else if (req.url == '/api/login') {
		let data = '';
		req.on('data', function(chunk) {
			data += chunk;
		});
		req.on('end', async function(){
			console.log(data);
			try {
				const user = JSON.parse(data);
				const token = await db.getAuthToken(user);
				tokens.push(token);
				res.writeHead(200);
				res.end(token);
			}
			catch(e) {
				res.writeHead(500);
				return res.end('Error: '+ e);
			}
		}); return
	}
	else{
		guarded(req, res);
	}
})
const io = new Server(server);
server.listen(3000);
io.use((socket, next) => {
	const cookie = socket.handshake.auth.cookie;
	const credentionals = getCredentionals(cookie);
	if(!credentionals) {
		next(new Error("no auth"));
	}
	socket.credentionals = credentionals;
	next();
})
io.on('connection', async(socket) =>{
	let userNickname = socket.credentionals?.login;
	let userID = socket.credentionals?.user_id;
	let userAv = socket.credentionals?.avatar;
	console.log(userAv);
	let messages = await db.getMessages();
	console.log(`a user connected. id -` + socket.id);

	socket.on('new_message', (message) =>{
		db.addMessage(message, userID, userAv);
		io.emit('message', {user: userNickname, content: message, avatar: userAv});
	})
	socket.emit('get_chat', messages);
});
function getCredentionals(c = '') {
	const cookies = cookie.parse(c);
	const token = cookies?.token;
	if(!token || !tokens.includes(token)) return null;
	const [user_id, login, avatar] = token.split('|');
	if(!user_id || !login) return null;
	return {user_id, login, avatar};
}
function guarded(req, res) {
	const credentionals = getCredentionals(req.headers?.cookie);
	if(!credentionals) {
		res.writeHead(302, {'Location' : '/register'});
	}
	if(req.method === 'GET') {
		switch(req.url) {
			case '/': return res.end(indexHtmlFile);
			case '/script.js': return res.end(indexJsFile);
		}
	}
}
