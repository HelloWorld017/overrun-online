'use strict';
var checkPass = require(global.pluginsrc('common-pass', 'check-pass'))('overrun');
var overrun = require('./overrun-game');

const GAME_NAME = 'OVERRUN-UNRANKED';

class OverrunUnrankedGame extends overrun.game{
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

OverrunUnrankedGame.getReadableName = () => {
	return global.translator('plugin.overrun.unranked');
};

OverrunUnrankedGame.getOptions = () => {
	return {
		'accepts_bot_type': ['OVERRUN-RANKED', 'OVERRUN-UNRANKED'],
		'show_to_bot_type': false,
		'check': checkPass
	};
};

module.exports = OverrunUnrankedGame;
