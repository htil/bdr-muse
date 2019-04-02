var express = require('express');
var app = express();
var server = require('http').createServer(app);
var sock = null;
var port = 8888;
var keypress = require('keypress');
var flying = true;

/**
 * ROS Topic Publishing
 */
// const nh = rosnodejs.nh;
// const pub = nh.advertise('/engagement', 'std_msgs/Float32');

server.on('error', function (e) {
  // Handle your error here
  console.log(e);
});


var Server = function(browserPort) {
	this.io = require('socket.io')(server); //Creates my http server
	app.use(express.static(__dirname));
	server.listen(browserPort, function () {
		console.log('Server listening at port %d', browserPort);
	});
	this.io.on('connection', this.handleConnection)
}

Server.prototype.handleConnection = function(socket){
	sock = socket;
	sock.on('error', () => {});

	sock.on("cmd", function(msg){
		switch (msg) {
			case 'takeoff' :
					if (!flying){
						console.log(msg)
						flying = true;
					}
			 		break;
			case 'forward' :
					console.log(msg)
					// drone.forward(speed);
					// setTimeout(function(){drone.stop()}, flightTime);
					break;
			case 'land' :
					console.log(msg)
					// drone.land() ;
					flying = false;
					break;
		}
	});

	sock.on("engagement", (msg) => {
		pub.publish({ data: msg });
	});
}

Server.prototype.init = () => {
	console.log("Server initialized!");
	
}

Server.prototype.sendClientMsg = (id, msg) => {
	if(sock) {
		sock.emit(id, {msg:msg});
	}
}

server = new Server(port);
server.init();