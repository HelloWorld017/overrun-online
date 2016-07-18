'use strict';
class Bot{
	constructor(player, skin, name, code, type, playable){
		this.player = player;
		this.skin = skin;
		this.name = name;
		this.code = code;
		this.type = type;
		this.playable = playable || true;
	}
}

module.exports = Bot;
