'use strict';

var errors = require('./errors');

var Server = require('./server');

var EmailNotVerifiedError = errors.EmailNotVerifiedError;
var PasswordNotEqualError = errors.PasswordNotEqualError;

class Player{
	constructor(data){
		this.name = data.name;
		this.stat = data.stat;
		this.skins = data.skins;
		this.money = data.money;
		this.point = data.point;
		this.pw = data.pw;
		this.emailVerified = data.emailVerified;
		this.unregistered = data.unregistered;

		//TODO Integrate with mongodb!
		callbacks.forEach((k) => {
			this.socket.on(k, (data) => {
				Server.trigger(k, data);
			});
		});

		this.bots = data.bots.map((v) => return new Bot(this, v.skin, v.name, v.code)));

		this.currentGame = undefined;
	}

	getStat(){
		return this.stat;
	}

	getPoint(){
		return this.point;
	}

	getName(){
		return this.name;
	}

	getSocket(){
		return this.socket;
	}

	auth(pw){
		if(this.unregistered){
			cb(new PasswordNotEqualError(), false);
			return;
		}

		bcrypt.compare(pw, this.encryptedPw, (err, res) => {
			if(err){
				cb(err);
				return;
			}

			if(!res){
				cb(new PasswordNotEqualError(), false);
				return;
			}

			if(!this.emailVerified){
				cb(new EmailNotVerifiedError());
				return;
			}

			this.token = createToken(1024);
			cb(undefined, this.token);
		});
	}

	saveBots(){
		global.mongo
			.collection(global.config['db-'])
	}
}

module.exports = Player;
