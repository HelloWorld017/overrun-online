'use strict';
var async = require('async');
var Player = require('./player');

class TestMatchmaker{
	constructor(server, game, argument){
		this.pool = [];
		this.server = server;
		this.intervalId = undefined;
		this.isRemovalRequested = false;
		this.game = game;
		this.argument = argument;
	}

	entry(player, bot, response, argument){
		if(player.entryTick > Date.now()){
			response.json({
				'game-finish': false,
				err: global.translator('error.matchmake.tick')
			});
			return;
		}

		argument = this.argument.split('-');

		player.updateTimer();

		global.mongo
			.collection(global.config['collection-user'])
			.find({name: argument[0]})
			.toArray((err, players) => {
				if(err){
					console.error(err.toString());
					response.json({
						'game-finish': false,
						err: global.translator('error.internalserver')
					});
					return;
				}

				if(players.length <= 0){
					response.json({
						'game-finish': false,
						err: global.translator('error.matchmake.noplayer')
					});
					return;
				}

				var againstPlayer = new Player(players[0]);

				if(!againstPlayer.bots[argument[1]]){
					response.json({
						'game-finish': false,
						err: global.translator('error.matchmake.nobot')
					});
					return;
				}

				this.server.registerGame(new this.game(this.server.getGameId(), bot, againstPlayer.bots[argument[1]], this.server), [response]);
			});
	}

	remove(){

	}
}

module.exports = (server, game, arg) => {
	return new TestMatchmaker(server, game, arg);
};
