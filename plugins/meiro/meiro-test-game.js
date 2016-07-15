'use strict';
var async = require('async');
var checkPass = require(global.pluginsrc('common-pass', 'check-pass'))('meiro');
var meiro = require('./meiro-game');

const GAME_NAME = 'MEIRO-TEST';

class MeiroTestGame extends meiro.game{
	constructor(gid, bot1, bot2, server){
		super(gid, bot1, bot2, [bot1.player, bot2.player], server);

		this.players.forEach((v) => {
			v.currentGame = this;
		});

		this.name = GAME_NAME;
		this.resetRound();
	}

	handleWin(gameLog, cb, score){
		var date = new Date();
		var bots = {};
		async.each(this.bots, (v, cb) => {
			bots[v.getPlayer().getName()] = {
				skin: global.skin(v.getSkin()),
				name: v.getName()
			};
			cb();
		}, () => {
			var battleLog = {
				id: this.battleId,
				players: this.players.map((v) => v.getName()),
				bots: bots,
				score: score,
				date: date.getMilliseconds(),
				dateTime: Date.now(),
				log: gameLog,
				type: 'MEIRO',
				'game-finish': true
			};

			this.server.removeGame(this.gameId, function(responses){
				responses.forEach((v) => {
					v.json(battleLog);
				});
				cb(false);
			});
		});
	}
}

MeiroTestGame.getName = () => {
	return GAME_NAME;
};

MeiroTestGame.getReadableName = () => {
	return global.translator('plugin.meiro.ranked');
};

MeiroTestGame.getOptions = () => {
	return {
		'accepts_bot_type': ['MEIRO-RANKED', 'MEIRO-UNRANKED'],
		'show_to_bot_type': false,
		'check': checkPass
	};
};

module.exports = MeiroTestGame;
