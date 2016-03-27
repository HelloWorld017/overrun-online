'use strict';
var matchmake = require('./matchmake');

class Server{
	constructor(){
		this.callbacks = [];
		this.players = {};
		this.games = {};
		this.gamePool = {};
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

	addToPool(game){
		this.gamePool[game.getName()] = game;
		this.matchmakers[game.getName()] = matchmake(this, game);
	}

	login(user){
		this.players[user.getName()] = user;
	}

	removeGame(gid){
		this.games[gid].responses.forEach((v) => {
			v.json({
				gameFinish: true
			});
		});

		this.games[gid] = undefined;
	}

	registerGame(game, responses){
		this.games[game.gameId] = {
			game: game,
			responses: responses
		};
	}

	getGameId(){
		return this.gameCounts++;
	}
};

module.exports = Server;
