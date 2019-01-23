var express = require('express');
var app = express();
var server = require('http').createServer(app);
var sock = null;
var flightTime = 500;
var port = 8888;
var keypress = require('keypress');
var bebop = require('node-bebop');
var drone = bebop.createClient();
drone.connect();
var takeOff = 0;
var speed = 15;
var flying = true;

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



}

Server.prototype.handleConnection = function(socket){
	sock = socket;
	console.log(sock.id);
	sock.on('error', () => {});

	sock.on("cmd", function(msg){
		switch (msg) {
			case 'takeoff' :
					if (!flying){
						console.log(msg)
						drone.takeOff();
						flying = true;
					}
			 		break;
			case 'forward' :
					console.log(msg)
					drone.forward(speed);
					setTimeout(function(){drone.stop()}, flightTime);
					break;
			case 'land' :
					console.log(msg)
					drone.land() ;
					flying = false;
					break;
		}
	})

}

Server.prototype.init = function(){
	console.log("Server initialized!")
	this.io.on('connection', this.handleConnection)
}

Server.prototype.sendClientMsg = function(id, msg) {
	if(sock) {
		sock.emit(id, {msg:msg});
	}
}

server = new Server(port);
server.init();



/* Bebop */




/*
// make `process.stdin` begin emitting "keypress" events
var startBebop = function() {
		drone.connect();
		keypress(process.stdin);
		// listen for the "keypress" event
		process.stdin.on('keypress', function (ch, key) {
		  //console.log('got "keypress"', key); //use to determine keyname
		  if (key && key.ctrl && key.name == 'c') {
		    process.exit();
		  } else {
		    switch (key.name)
		    {
		      case 'w' :
		      if (takeOff == 0 ){
		       console.log('takeoff\n');
		       drone.takeOff();
		       takeOff = 1;
		     } else { //else move forward
		       console.log('forward\n');
		        drone.forward(speed);
		       //stop drone from moving forward after one second
		       setTimeout(function() {
		         //term.bold('stop');
		         drone.stop();
		        },flightTime);
		      }
		     break ;

		     case 'space' :
		       console.log('land\n');
		       drone.land() ;
		       takeOff = 0;
		       if (takeOff == 0)
		          setTimeout(function(){process.exit(1);},100);
		       break ;

		      case 'f' :
		       console.log('flip\n');
		       drone.backFlip() ;
		       //takeOff = 0;
		       break ;

		    }
		  }
		});
	process.stdin.setRawMode(true);
	process.stdin.resume();
}
*/
