'use strict';
var matchmake = require('./matchmake');

class Server{
	constructor(){
		this.callbacks = [];
		this.players = {};
		this.games = {};
		this.matchmakers = {};
	}

	trigger(name, data){
		this.callbacks.forEach((v) => {
			v(name, data);
		});
	}

	bind(callback){
		this.callbacks.push(callback);
	}

	addMatchMaker(game){
		this.matchmakers[game.getName()] = matchmake(this, game);
	}

	login(user){
		this.players[user.getName()] = user;
	}

	removeGame(gid){
		this.games[gid] = undefined;
	}

	registerGame(game){
		this.games[game.gameId] = game;
	}

	getGameId(){
		return this.gameCounts++;
	}
};

module.exports = Server;
