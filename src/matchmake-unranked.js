'use strict';
var async = require('async');
var Player = require('./player');

class UnrankedMatchmaker{
	constructor(server, game){
		this.pool = [];
		this.server = server;
		this.intervalId = undefined;
		this.isRemovalRequested = false;
		this.game = game;
	}

	entry(player, bot, response, argument){
		if(player.currentGame !== undefined){
			response.json({
				'game-finish': false,
				err: global.translator('err.matchmake.ingame')
			});
			return;
		}

		if(player.entryTick < Date.now()){
			response.json({
				'game-finish': false,
				err: global.translator('err.matchmake.tick')
			});
			return;
		}

		argument = argument.split('-');
		if(argument.length < 1) return;

		player.updateTimer();

		global.mongo
			.collection(global.config['collection-user'])
			.find({name: argument[0]})
			.toArray((err, players) => {
				if(err){
					console.error(err.toString());
					response.json({
						'game-finish': false,
						err: global.translator('err.internalserver')
					});
					return;
				}

				if(players.length <= 0){
					response.json({
						'game-finish': false,
						err: global.translator('err.matchmake.noplayer')
					});
					return;
				}

				var againstPlayer = new Player(players[0]);

				if(!againstPlayer.bots[argument[1]]){
					response.json({
						'game-finish': false,
						err: global.translator('err.matchmake.nobot')
					});
					return;
				}

				this.server.registerGame(new this.game(this.server.getGameId(), bot, againstPlayer.bots[argument[1]], this.server), [response]);
			});
	}

	remove(){

	}
}

module.exports = (server, game) => {
	return new UnrankedMatchmaker(server, game);
};
