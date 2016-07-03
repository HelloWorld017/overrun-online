'use strict';
var EventEmitter = require('events');
var matchmake = require('./matchmake');

class Server extends EventEmitter{
	constructor(){
		super();
		this.players = {};
		this.games = {};
		this.gamePool = {};
		this.matchmakers = {};
		this.gameCounts = 0;
	}

	addToPool(game, matchmaker, isLoadedMatchmaker){
		this.gamePool[game.getName()] = game;
		this.matchmakers[game.getName()] = isLoadedMatchmaker ? matchmaker : matchmake(this, game);
	}

	login(user){
		this.players[user.getName()] = user;
	}

	removeGame(gid, cb){
		var battleId = this.games[gid].game.getBattleId();
		if(typeof cb !== 'function'){
			this.games[gid].responses.forEach((v) => {
				v.json({
					'game-finish': true,
					log: battleId
				});
			});
		}else{
			cb(this.games[gid].responses);
		}

		this.games[gid] = undefined;
	}

	registerGame(game, responses){
		this.games[game.gameId] = {
			game: game,
			responses: responses
		};
		game.start();
	}

	getGameId(){
		return this.gameCounts++;
	}
};

module.exports = Server;
