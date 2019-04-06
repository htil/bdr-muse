const dgram = require('dgram');
const server = dgram.createSocket('udp4');
server.bind(8001);

function sendMessage(message_text){
	let message = new Buffer(message_text);
	let port = 8889;
	let host = '192.168.10.1';

	server.send(message, 0, message.length, port, host, function(err, bytes) {
		if (err) throw err;
	});
}

module.exports.init = () => {
	server.on('message', (msg,info) => {
		console.log('Data received from server : ' + msg.toString());
		console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
	});
	
	sendMessage('command');
}
module.exports.exit = () => server.close();
module.exports.takeoff = () => sendMessage('takeoff');
module.exports.land = () => sendMessage('land');
module.exports.speed = (value) => sendMessage('speed ' + value);
module.exports.battery = () => sendMessage('battery?');
module.exports.forward = (distance) => sendMessage('forward ' + distance);
