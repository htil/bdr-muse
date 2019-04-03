const express = require('express');
const app = express();
var server = require('http').createServer(app);
const keypress = require('keypress');
const rosnodejs = require('rosnodejs');
const std_msgs = rosnodejs.require('std_msgs').msg;

var socket = null;
var port = 8888;

// ROS Publisher
const node = rosnodejs.initNode('muse_bci');
const nh = rosnodejs.nh;
const pub = nh.advertise('/engagement', 'std_msgs/Float32');


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

Server.prototype.handleConnection = function(sock){
	socket = sock;
	socket.on('error', () => {});
	socket.on("engagement", (msg) => {
		pub.publish({data: msg});
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

server = new Server(port);
server.init();
