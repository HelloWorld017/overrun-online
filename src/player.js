'use strict';
const callbacks = [
	'code', 'ready', 'join', 'entry'
];

var Server = require('./server');

class Player{
	constructor(socket, name){
		this.socket = socket;
		this.name = name;
		this.stat = {
			win: 0,
			defeat: 0,
			draw: 0
		};
		//TODO Integrate with mongodb!
		callbacks.forEach((k) => {
			this.socket.on(k, (data) => {
				Server.trigger(k, data);
			});
		});

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
