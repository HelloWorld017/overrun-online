'use strict';
var async = require('async');
var checkPass = require(global.pluginsrc('common-pass', 'check-pass'))('meiro');
var meiro = require('./meiro-game');
var PointCalculator = require(global.src('calculate-point'));

const GAME_NAME = 'MEIRO-RANKED';
class MeiroRankedGame extends meiro.game{
	constructor(gid, bot1, bot2, server){
		super(gid, bot1, bot2, [bot1.player, bot2.player], server);

		this.players.forEach((v) => {
			v.currentGame = this;
		});

		this.name = GAME_NAME;
		this.resetRound();
	}

	handleWin(gameLog, callback, score){
		var p1 = this.players[0];
		var p2 = this.players[1];
		if(score[p1.getName()] === score[p2.getName()]){
			p1.getStat().draw++;
			p2.getStat().draw++;
		}else{
			var win;
			var defeat;

			if(score[p1.getName()] > score[p2.getName()]){
				//[win, defeat] = [p1, p2];
				win = p1;
				defeat = p2;
			}else{
				//[win, defeat] = [p2, p1];
				win = p2;
				defeat = p1;
			}

			win.point = Math.clamp(0, 1e+11, win.point + PointCalculator.win(win.getPoint(), defeat.getPoint()));
			win.money = Math.clamp(0, 1e+11, defeat.point + PointCalculator.winMoney(win.getPoint()));
			win.getStat().win++;

			defeat.point = Math.clamp(0, 1e+11, defeat.point - PointCalculator.defeat(win.getPoint(), defeat.getPoint()));
			defeat.money = Math.clamp(0, 1e+11, defeat.point + PointCalculator.defeatMoney(defeat.getPoint()));
			defeat.getStat().defeat++;
		}

		p1.saveStat();
		p2.saveStat();
		callback(true);
	}
}

MeiroRankedGame.getName = () => {
	return GAME_NAME;
};

MeiroRankedGame.getReadableName = () => {
	return global.translator('plugin.meiro.ranked');
};

MeiroRankedGame.getOptions = () => {
	return {
		'accepts_bot_type': ['MEIRO-RANKED', 'MEIRO-UNRANKED'],
		'show_to_bot_type': true,
		'check': checkPass
	};
};

module.exports = MeiroRankedGame;
