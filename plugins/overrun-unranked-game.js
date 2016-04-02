'use strict';
var MatchMaker = require('../src/matchmake');
var OverrunGame = require('./overrun-game').game;
var Player = require('../src/player');
var PointCalculator = require('../src/calculate-point');

const GAME_NAME = 'OVERRUN-UNRANKED';
class OverrunUnrankedGame extends OverrunGame{
	constructor(gid, bot1, bot2, server){
		super(gid, bot1, bot2, [bot1.player, bot2.player], server);

		this.players.forEach((v) => {
			v.currentGame = this;
		});

		this.name = GAME_NAME;
	}

	getPlayerByName(name, callback){
		async.each(this.players, (v, cb) => {
			if(v.getName() === name){
				cb(v);
			}
		}, (player) => {
			callback(player);
		});
	}
}

OverrunUnrankedGame.getName = () => {
	return GAME_NAME;
};

class UnrankedMatchmaker extends MatchMaker{
	constructor(server, game){
		super(server, game);
	}

	entry(player, bot, response, argument){
		if(player.currentGame !== undefined) return;
		if(player.entryTick < Date.now()) return;

		argument = argument.split('-');
		if(argument.length < 1) return;

		player.updateTimer();

		async.every(this.pool, (poolEntry, cb) => {
			cb(null, poolEntry.player.getName() !== player.getName());
		}, (err, res) => {
			if(res){
				global.mongo
				.collection(global.config['collection-user'])
				.find({name: argument[0]})
				.toArray((err, players) => {
					if(err){
						console.error(err.toString());
						return;
					}

					if(players.length <= 0) return;

					var againstPlayer = new Player(players[0]);

					if(!againstPlayer.bots[argument[1]]) return;

					this.server.registerGame(new this.game(this.server.getGameId(), bot, againstPlayer.bots[argument[1]], this.server), [response]);
				});
			}
		});
	}
}

module.exports = {
	name: 'Overrun Unranked',
	author: 'Khinenw',
	version: 'alpha 0.0.0 201604020001',
	onLoad: (cb) => {
		global.server.addToPool(OverrunUnrankedGame, (server, game) => {
			return new UnrankedMatchmaker(server, game);
		});
		cb();
	}
};
