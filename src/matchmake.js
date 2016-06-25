'use strict';
var async = require('async');

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

		player.updateTimer();

		var acceptsBotType = game.getOptions().accepts_bot_type;
		global.mongo
			.collection(global.config['collection-user'])
			.find({
				bots: {
					$elemMatch: {
						type: {
							$in: acceptsBotType
						}
					}
				}
			})
			.toArray((err, res) => {
				if(res.length <= 0){
					response.json({
						'game-finish': false,
						err: global.translator('err.matchmake.noplayer')
					});
					return;
				}

				var targetBot = res.sort((a, b) => {
					return Math.abs(a.point - player.point) - Math.abs(b.point - player.point);
				})[0].bots.filter((v) => {
					return acceptsBotType.indexOf(v.type) !== -1;
				})[0]

				this.server.registerGame(new this.game(this.server.getGameId(), bot, targetBot, this.server), [
					response
				]);
			});
	}

	onRun(){
		global.mongo
			.collection(global.config['collection-user'])
			.find({
				bots: {
					$in: [game]
				}
			})
		this.pool.sort((a, b) => {
			return (a.getPoint() - b.getPoint());
		});
	}

	remove(){

	}
}

module.exports = (server, game) => {
	var matchmaker = new MatchMaker(server, game);
	return matchmaker;
};
