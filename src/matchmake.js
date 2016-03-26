'use strict';
var async = require('async');

const TICK = 5000;

class MatchMaker{
	constructor(server, game){
		this.pool = [];
		this.server = server;
		this.intervalId = undefined;
		this.game = game;
	}

	entry(player, bot){
		if(player.currentGame !== undefined) return;

		async.every(this.pool, (poolEntry, cb) => {
			cb(null, poolEntry.player.getName() !== player.getName());
		}, (err, res) => {
			if(res){
				this.pool.push({
		            player: player,
		            bot: bot
		        });
			}
		});
	}

	onRun(){
		this.pool.sort((a, b) => {
			return (a.getPoint() - b.getPoint());
		});

		for(var i = 0; i < this.pool.length; i += 2){
			if(this.pool.hasOwnProperty(i) && this.pool.hasOwnProperty(i + 1)){
				this.server.registerGame(new this.game(this.server.getGameId(), this.pool[i].bot, this.pool[i + 1].bot, this.server));
			}
		}
	}

	remove(){
		clearInterval(this.intervalId);
	}
}

module.exports = (server, game) => {
	var matchmaker = new MatchMaker(server, game);
	matchmaker.intervalId = setInterval(() => {
		matchmaker.onRun();
	}, TICK);
	return matchmaker;
};
