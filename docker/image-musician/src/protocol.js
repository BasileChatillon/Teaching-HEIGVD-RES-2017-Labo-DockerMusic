/*
 * Our application protocol specifies the following default multicast address, port, List of instruments and their sound
 * and the intervalle of sending the informations
 */
 
exports.PROTOCOL_MULTICAST_ADDRESS = "239.255.22.5";

exports.PROTOCOL_PORT = 2205;

exports.INSTRUMENTS_SOUNDS = {
	piano: "ti-ta-ti",
	trumper: "pouet",
	flute: "trulu",
	violin: "gzi-gzi",
	drum: "boom-boom"
};

exports.INTERVAL = 1000;