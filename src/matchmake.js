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

	entry(player, bot, response){
		if(player.currentGame !== undefined) return;
		if(player.entryTick < Date.now()) return;
		
		player.updateTimer();

		async.every(this.pool, (poolEntry, cb) => {
			cb(null, poolEntry.player.getName() !== player.getName());
		}, (err, res) => {
			if(res){
				this.pool.push({
					player: player,
					bot: bot,
					response: response
				});
			}
		});
	}

	onRun(){
		this.pool.sort((a, b) => {
			return (a.getPoint() - b.getPoint());
		});

		var allMatchProcessed = true;

		for(var i = 0; i < this.pool.length; i += 2){
			if(this.pool.hasOwnProperty(i) && this.pool.hasOwnProperty(i + 1)){
				this.server.registerGame(new this.game(this.server.getGameId(), this.pool[i].bot, this.pool[i + 1].bot, this.server), [
					this.pool[i].response,
					this.pool[i + 1].response
				]);
			}else{
				allMatchProcessed = false;
			}
		}

		if(allMatchProcessed){
			this.pool = [];
		}else{
			this.pool = [this.pool[this.pool.length - 1]];
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
