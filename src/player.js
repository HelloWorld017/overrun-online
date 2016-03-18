'use strict';

var errors = require('./errors');
var Server = require('./server');

var EmailNotVerifiedError = errors.EmailNotVerifiedError;
var PasswordNotEqualError = errors.PasswordNotEqualError;

class Player{
	constructor(data){
		this.name = data.name;
		this.nickname = data.nickname;
		this.email = data.email;
		this.friends = [];
		this.pw = data.pw;
		this.stat = data.stat;
		this.skins = data.skins;
		this.money = data.money;
		this.point = data.point;
		this.emailVerified = data.emailVerified;
		this.unregistered = data.unregistered;
		this.bots = data.bots.map((v) => return new Bot(this, v.skin, v.name, v.code)));

		this.currentGame = undefined;
		this.lastGame = undefined;
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

	saveStat(){
		global.mongo
			.collection(global.config['collection-user'])
			.findOneAndUpdate({id: this.name}, {
				$set: {
					money: this.money,
					point: this.point,
					stat: this.stat
				}
			});
	}

	saveBots(){
		global.mongo
			.collection(global.config['collection-user'])
			.findOneAndUpdate({id: this.name}, {
				$set: {
					bots: this.bots.map((v) => {
						return {
							skin: v.skin,
							name: v.name,
							code: v.code
						};
					})
				}
			});
	}

	gameEnd(){
		this.lastGame = this.currentGame;
		this.currentGame = undefined;
	}
}

Player.register = (data) => {
	global.mongo
		.collection(global.config['collection-user'])
		.insert({
			name: data.id,
			nickname: data.name,
			email: data.email,
			pw: data.password,
			friends: [],
			unregistered: false,
			emailVerified: false,
			bot: [],
			skins: [],
			stat: {
				win: 0,
				defeat: 0,
				draw: 0
			},
			point: 0,
			money: 0
		});

	global.mongo
		.collection(global.config['collection-auth'])
		.insert({
			id: data.id,
			authToken: data.authToken
		});
};

module.exports = Player;
