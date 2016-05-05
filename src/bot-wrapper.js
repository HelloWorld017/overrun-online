'use strict';
var Library = require('./library');

const SPEED = 1;

class BotWrapper{
	constructor(bot, game){
		this.bot = bot;
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
			.nudgeX(parseInt((Math.sin(yaw) * PLAYER_SPEED).toFixed(10)))
			.nudgeY(parseInt((Math.cos(yaw) * PLAYER_SPEED).toFixed(10)));
	}

	getBot(){
		return this.bot;
	}

	getName(){
		return this.getBot().name;
	}

	getSkin(){
		return this.getBot().skin;
	}

	getCode(){
		return this.getBot().code;
	}

	getPlayer(){
		return this.getBot().player;
	}
}

module.exports = BotWrapper;
