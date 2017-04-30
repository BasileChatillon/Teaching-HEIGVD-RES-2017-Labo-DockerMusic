/*
 This program simulates a "data collection station", which joins a multicast
 group in order to receive measures published by thermometers (or other sensors).
 The measures are transported in json payloads with the following format:
   {"timestamp":1394656712850,"location":"kitchen","temperature":22.5}
 Usage: to start the station, use the following command in a terminal
   node station.js
*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * thermometer.js and station.js. The address and the port are part of our simple 
 * application-level protocol
 */
var protocol = require('./protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musicians. It is the UDP server
 */
var socketUDP = dgram.createSocket('udp4');

/*
 * We create a map of musicians so we can track them
 * We map the uuid with the date of the last msg sent buy the musician
 */
var mapMusicians = new Map();

socketUDP.bind(protocol.PROTOCOL_PORT_UDP, function() {
  console.log("Joining multicast group");
  socketUDP.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

/*
 * Function that will delete a given uuid from the map 
 */
function deleteInactiveMusician(uuid){
	console.log("suppresion du musicien : " + uuid); 
	mapMusicians.delete(uuid);
}

/* 
 * This call back is invoked when a new datagram has arrived.
 */
socketUDP.on('message', function(msg, source) {
	console.log("Data has arrived: " + msg + ". Source port: " + source.port);
	/* Firstly, we convert the msg into a JSON object */
	var date = Date();
	var msgJSON = JSON.parse(msg);
	var uuid = msgJSON.uuid;
	
	/*
	 * If the musicians is not yet in the map, we had his uuid. Otherwise, we delete the old
	 * timeOut and we create a new one
	 */ 
	if(mapMusicians.has(uuid)) {
		var musician = mapMusicians.get(uuid);
		clearTimeout(musician.timeOut);
		musician.timeOut = setTimeout(deleteInactiveMusician, protocol.TIMEOUT, uuid);
	}
	else{
		console.log("Welcome, you new musician!");
		mapMusicians.set(uuid, {
			"instrument":  msgJSON.instrument,
			"sound":       msgJSON.sound,
			"ActiveSince": date,
			"timeOut" : setTimeout(deleteInactiveMusician, protocol.TIMEOUT, uuid)
		});
	}		
});

/*
 * function that take our map, and tranform it in an array that is ready to be sent by the tcp serveur
 */
function mapToArray() {
	console.log("Converting the map of musicians");
	var tab = [];
	/*
	 * Using the for each method to call a function on each member of the Map
	 * https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Map/forEach
	 */
	mapMusicians.forEach(function(val, key, map) {
		/*
		 * we had the different values into a dico, that we had to the tab
		 */
		tab.push({
			"uuid" : key,
			"instrument" : val.instrument,
			"activeSince" : val.ActiveSince
		});
	});
	
	return tab;
}


/*
 * Finally we got to create the TCP serveur thanks to net.
 */
var net = require('net');
var serveurTCP = net.createServer(function(socketTCP) {
	console.log("Welcome!");
	msgJSON = JSON.stringify(mapToArray());
	socketTCP.write(msgJSON);
	socketTCP.end();
})

serveurTCP.listen(protocol.PROTOCOL_PORT_TCP);


	

