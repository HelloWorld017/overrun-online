'use strict';
class Server{
	constructor(){
		this.callbacks = [];
		this.players = {};
		this.games = {};
	}

	trigger(name, data){
		this.callbacks.forEach((v) => {
			v(name, data);
		});
	}

	bind(callback){
		this.callbacks.push(callback);
	}

	login(user){
		this.players[user.getName()] = user;
	}

	removeGame(gid){
		this.games[gid] = undefined;
	}
};

module.exports = Server;
