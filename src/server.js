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
	}

	addToPool(game, matchmaker){
		this.gamePool[game.getName()] = game;
		this.matchmakers[game.getName()] = matchmaker ? matchmaker(this,game) : matchmake(this, game);
	}

	login(user){
		this.players[user.getName()] = user;
	}

	removeGame(gid){
		this.games[gid].responses.forEach((v) => {
			v.json({
				'game-finish': true,
				log: this.games[gid].getBattleId()
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
