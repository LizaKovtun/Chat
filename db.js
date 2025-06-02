const fs = require("fs");
const dbFile = "./chat.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
const crypto = require("crypto");
let db;
dbWrapper
.open({
	filename: dbFile,
	driver: sqlite3.Database
})
.then( async dBase =>{
 db = dBase;
 try {
 	if(!exists){
 		await db.run(
 			`CREATE TABLE user(
 			user_id INTEGER PRIMARY KEY AUTOINCREMENT,
 			login TEXT,
 			password TEXT,
 			salt TEXT,
 			avatar TEXT
 			);
 			`
 		);
 		await db.run(
 			`CREATE TABLE message(
 			msg_id INTEGER PRIMARY KEY AUTOINCREMENT,
 			content TEXT,
 			author INT,
 			FOREIGN KEY (author) REFERENCES user(user_id)
 			);
 			`
 		);
 		await db.run(
 			`INSERT INTO user(login, password) VALUES('robouser', '1111'), ('newuser', '2222'), ('catuser', '33333');
 			`
 		);
 	} else {
 		console.log(await db.all("SELECT * FROM user"));
 		console.log(await db.all("SELECT * FROM message"));
 	}
 } catch (dbError) {
 	console.error(dbError);
 }
});
module.exports = {
	getMessages: async () => {
		try {
			return await db.all(
				`
				SELECT msg_id, content, login, user_id, avatar FROM message
				JOIN user ON message.author = user.user_id`
				);
		} catch(dbError) {
			console.error(dbError);
		}
	},
	addMessage: async (msg, userId) => {
		await db.run(
			`INSERT INTO message (content, author) VALUES (?, ?)`,
			[msg, userId]
		);
	},
	userCheck: async (login) => {
		let user_checker = await db.all(
			`SELECT * FROM user WHERE login = ?`,
			[login]
		);
		return !!user_checker.length;
	},
	addUser: async (login, password, avatar) => {
		const salt = crypto.randomBytes(16).toString('hex');
		const saltedpass = crypto.pbkdf2Sync(password, salt, 1000, 64,  `sha512`).toString('hex');
		await db.run(
			`INSERT INTO user (login, password, salt, avatar) VALUES (?, ?, ?, ?)`,
			[login, saltedpass, salt, avatar]
		);
	},
	getAuthToken: async (user)=> {
		const candidate = await db.all(`SELECT * FROM user WHERE login = ?`,
			[user.login]);
		if(!candidate.length) {
			throw 'Wrong login';
		}
		const {user_id, login, password, salt, avatar} = candidate[0];
		let password_n_salt = crypto.pbkdf2Sync(user.password, salt, 1000, 64,  `sha512`).toString('hex');
		if(candidate[0].password !== password_n_salt) {
			throw 'Wrong password'
		};
		return candidate[0].user_id + '|' + candidate[0].login + '|' + candidate[0].avatar +'|' + crypto.randomBytes(20).toString('hex');
	}
};
