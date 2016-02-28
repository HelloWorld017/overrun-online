'use strict';
const callbacks = [
	'code', 'ready', 'join', 'entry'
];

var Server = require('./server');

class Player{
	constructor(socket, data){
		this.socket = socket;
		this.name = data.name;
		this.stat = data.stat;

		//TODO Integrate with mongodb!
		callbacks.forEach((k) => {
			this.socket.on(k, (data) => {
				Server.trigger(k, data);
			});
		});

		this.bots = data.bots.map((v) => return new Bot(this, v.skin, v.name, v.code)));

		this.currentGame = undefined;
	}

	getStat(){
		return this.stat;
	}

	getName(){
		return this.name;
	}

	getSocket(){
		return this.socket;
	}
}

module.exports = Player;
