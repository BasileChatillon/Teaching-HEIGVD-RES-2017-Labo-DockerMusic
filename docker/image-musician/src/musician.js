/*
 This program simulates a musician, which plays music on a multicast group. 
 An auditor can join the program and listen to the music. The music is transported 
 in json payloads with the following format:
   {"uuid":"aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60","instrument":"piano",
    "sound":"ti-ta-ti", "activeSince":"2016-04-27T05:20:50.731Z"}
 Usage: to start a musician, type the following command in a terminal
        (of course, you can run several musician in parallel and observe that all
        the musics are transmitted via the multicast group):
   node musician.js instrument
*/

var protocol = require('./protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var socket = dgram.createSocket('udp4');

/*
 * To generate unique ID
 */
var uuid = require('uuid');

/*
 * Let's define a javascript class for our musician. The constructor accepts
 * an instrument
 */
function Musician(instrument) {
	this.Muuid = uuid.v4();
	this.instrument = instrument;
	this.sound = protocol.INSTRUMENTS_SOUNDS[instrument];
	this.activeSince = Date();
	
	/*
	 * Let's create a new musician then we do that every interval, the musician will sing in the multicast group
     */
	setInterval(this.send.bind(this), protocol.INTERVAL);
}

/*
 * I declare this methode outside the class definition, so there is only one method for all the class.
 * The counter part is that I have to call the setInterval method later
 */
Musician.prototype.send = function(){
	/* 
	 * Definition of the things to send 
	 */
	var toSend = {
		uuid: 		 this.Muuid,
		instrument:  this.instrument,
		sound:		 this.sound,
		activeSince: this.activeSince
	}
	/* Tranformation of the message */
	var payload = JSON.stringify(toSend)
	message = new Buffer(payload);
	/* Sending the message */
	socket.send(message, 0, message.length, protocol.PROTOCOL_PORT_UDP, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
		console.log("Sending payload: " + payload + " via port " + socket.address().port);
	});
}

	

/*
 * Let's get the thermometer properties from the command line attributes
 */
var instrument = process.argv[2];

/*
 * We want to be sur that the instrument is well known. Therefore, we check if he is in the list.
 */
if(protocol.INSTRUMENTS_SOUNDS[instrument] === "undefined"){
	process.on("exit", function () {
        console.log("The instrument " + instrument + " is unknow.");
        process.exit(1);
    });
}


/*
 * Let's create a new musician
 */
var m1 = new Musician(instrument);