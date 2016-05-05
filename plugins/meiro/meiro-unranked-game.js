'use strict';
var checkPass = require(global.pluginsrc('common-pass', 'check-pass'))('meiro');
var meiro = require('./meiro-game');

const GAME_NAME = 'MEIRO-UNRANKED';

class MeiroUnrankedGame extends meiro.game{
	constructor(gid, bot1, bot2, server){
		super(gid, bot1, bot2, [bot1.player, bot2.player], server);

		this.players.forEach((v) => {
			v.currentGame = this;
		});

		this.name = GAME_NAME;
		this.resetRound();
	}
}

MeiroUnrankedGame.getName = () => {
	return GAME_NAME;
};

MeiroUnrankedGame.getReadableName = () => {
	return global.translator('plugin.meiro.ranked');
};

MeiroUnrankedGame.getOptions = () => {
	return {
		'accepts_bot_type': ['MEIRO-RANKED', 'MEIRO-UNRANKED'],
		'show_to_bot_type': true,
		'check': checkPass
	};
};

module.exports = MeiroUnrankedGame;
