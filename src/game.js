'use strict';
class Game{
	constructor(gid, bot1, bot2, players, server){
		this.gameId = gid;
		this.battleId = `${players.map((v) => v.getName()).join('-')}-${(new Date()).format('yyyy-mm-dd-HH-mm-ss')}`;
		this.players = players;
		this.server = server;
	}

	getBattleId(){
		return this.battleId;
	}

	getName(){
		return '';
	}

	start(){

	}
}

module.exports = Game;
