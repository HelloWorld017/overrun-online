'use strict';
var Library = require('./library');

const PLAYER_SPEED = 1;

class OverrunPlayer{
	constructor(p, game){
		this.player = p;
		p.currentGame = game;
		p.getSocket().emit('join');
		this.boundBox = new Library.AABB(new Library.Position(0, 0), new Library.Position(1, 1));
		this.yaw = 0;
		this.metadata = {};
	}

	getBoundBox(){
		return this.boundBox;
	}

	rotation(i){
		if(i === undefined) return this.yaw;

		this.yaw = i;
		return this;
	}

	move(){
		getBoundBox()
			.nudgeX(parseInt((Math.sin(yaw) * PLAYER_SPEED).toFixed(10)));
			.nudgeY(parseInt((Math.cos(yaw) * PLAYER_SPEED).toFixed(10)));
	}

	getPlayer(){
		return this.player;
	}

	getName(){
		return this.getPlayer().getName();
	}
}
