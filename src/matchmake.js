'use strict';
var async = require('async');
var Player = require('./player');

const TICK = 5000;

class MatchMaker{
	constructor(server, game){
		this.server = server;
		this.intervalId = undefined;
		this.game = game;
	}

	entry(player, bot, response, argument){
		if(player.currentGame !== undefined){
			response.json({
				'game-finish': false,
				err: global.translator('error.matchmake.ingame')
			});
			return;
		}

		if(player.entryTimer > Date.now()){
			response.json({
				'game-finish': false,
				err: global.translator('error.matchmake.tick')
			});
			return;
		}

		if(!bot.playable){
			response.json({
				'game-finish': false,
				err: global.translator('error.matchmake.playable')
			});
		}

		player.updateTimer();

		var acceptsBotType = this.game.getOptions().accepts_bot_type;
		global.mongo
			.collection(global.config['collection-user'])
			.find({
				$and: [
					{
						bots: {
							$elemMatch: {
								type: {
									$in: acceptsBotType
								}
							},
							playable: true
						}
					},
					{
						name: {
							$not: {
								$eq: player.getName()
							}
						}
					}
				]
			})
			.toArray((err, res) => {
				if(err){
					response.json({
						'game-finish': false,
						err: global.translator('error.internalserver')
					});
					return;
				}

				if(res.length <= 0){
					response.json({
						'game-finish': false,
						err: global.translator('error.matchmake.noplayer')
					});
					return;
				}

				var targetPlayerData = res.sort((a, b) => {
					return Math.abs(a.point - player.point) - Math.abs(b.point - player.point);
				})[0];

				var targetPlayer = (this.server.players[targetPlayerData.name] === undefined) ? new Player(targetPlayerData) : this.server.players[targetPlayerData.name];

				var targetBot = targetPlayer.bots.filter((v) => {
					return acceptsBotType.indexOf(v.type) !== -1;
				})[0]

				this.server.registerGame(new this.game(this.server.getGameId(), bot, targetBot, this.server), [
					response
				]);
			});
	}

	remove(){

	}
}

module.exports = (server, game) => {
	var matchmaker = new MatchMaker(server, game);
	return matchmaker;
};
