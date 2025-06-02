const mysql = require('mysql2');
const http = require('http');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'chat'
})
const server = http.createServer((req, res)=>{
	if(req.url == "/messages") {
		connection.query(
	`SELECT content FROM message`,
	function(err, results, fields){
		console.log(results);
		let html = `<html><body><ul>`;
		results.forEach(f => { html += `<li>${f.content}</li>`;
			console.log(f)});
		html += `</ul><br><form action="/submitpage" method="POST"><input type="text" name="add_message"></form></body></html>`;
		res.end(html);
	})
	};
	if(req.url == "/submitpage"){
		let data = '';
		req.on('data', function(chunk){
			data += chunk;
		})
		req.on('end', function(){
			let data_param = new URLSearchParams(data);
			let get_text = data_param.get('add_message');
			connection.query(
	`INSERT INTO message(content, author_id, dialog_id) VALUES("${get_text}", 3, 5)`,
	function(err, results, fields) {
		res.writeHead(302, {'Location': '/messages'});
		res.end();
		}) 
	})
	}
	if(req.url == "/friends") {
		connection.query(
	`SELECT * FROM user`,
	function(err, results, fields){
		console.log(results);
		let html = `<html><body><ul>`;
		results.forEach(f => html += `<li>${f.login}</li>`);
		html += `</ul></body></html>`;
		res.end(html);
	})
	}
});
server.listen(3000);