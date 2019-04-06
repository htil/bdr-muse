const express = require('express');
const app = express();
var server = require('http').createServer(app);
const keypress = require('keypress');
const tello = require('./tello.js');
const readline = require('readline');

var socket = null;
var port = 8888;


// Server
server.on('error', function (e) {
	console.log(e);
});


var Server = function(browserPort) {
	this.io = require('socket.io')(server);
	this.io.on('connection', this.handleConnection)
	app.use(express.static(__dirname));
	server.listen(browserPort, function () {
		console.log('Server listening at port %d', browserPort);
	});
}

let engagement = 0;

Server.prototype.handleConnection = function(sock){
	socket = sock;
	socket.on('error', () => {});
	socket.on("engagement", (msg) => {
		engagement = msg;
	});
}

Server.prototype.init = () => {
	console.log("Server initialized!");
}

Server.prototype.sendClientMsg = (id, msg) => {
	if(socket) {
		socket.emit(id, {msg:msg});
	}
}

let tookoff = false;

function moveDrone(){
	let distance = 30;
	let threshold = 0.2;
	let drone_speed = Math.floor(70 * engagement + 30);
	if(engagement > threshold) {

		if(tookoff == false) {
			tookoff = true;
			console.log('Taking off');
			tello.takeoff();
			setTimeout(moveDrone, 5000);
			return;
		}

		console.log('Moving drone ' + distance + ' cm at ' + drone_speed + ' cm/s given engagement ' + Math.round(engagement * 100) / 100)
		tello.speed(drone_speed);
		tello.forward(distance);

		setTimeout(moveDrone, distance/drone_speed * 1000 + 200);
	} else {
		console.log('Engagement (' + Math.round(engagement * 100) / 100 + ') not past threshold of ' + threshold);

		setTimeout(moveDrone, 200);
	}
}

server = new Server(port);
server.init();
tello.init();
tello.battery();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
  
rl.question('Press enter to start ', (answer) => {
	moveDrone();
	rl.close();
});
