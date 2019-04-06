/** Class used to manage connection with node server.
 * @class
*/

var DataHolder = {beta: 0, alpha: 0, state: "Default"};
var AppState = {stop: true, sendRandomVals: true}
var MuseChannels = {TP9:0, Fp1:1, Fp2:2, TP10:3}


var NodeSocket = function(frequency) {
	this.socket = io();
	alpha = 0
	beta = 0

	this.forward = () => {
			console.log("forward")
			this.socket.emit("cmd", "forward")
	}

	this.takeOff = () => {
			console.log("takeoff")
			this.socket.emit("cmd", "takeoff")
	}

	this.land = () => {
			console.log("land")
			this.socket.emit("cmd", "land")
	}

	this.sendEngagement = (eng) => {
		console.log("Sending Engagement")
		this.socket.emit("engagement", eng);
	}

	this.socket.on('alpha', function(packet) {
		DataHolder.alpha = packet.msg[MuseChannels.Fp2];
	})

	this.socket.on('beta', function(packet) {
		DataHolder.beta = packet.msg[MuseChannels.Fp2];
	})

	setInterval(function(){
		if(!AppState.stop){
			if (AppState.sendRandomVals) {
				plot.plot(Math.random(), Math.random(), state)
			} else {
				plot.plot(DataHolder.alpha, DataHolder.beta, state)
			}
		}
	}, frequency);

}
