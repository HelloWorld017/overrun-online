'use strict';
var async = require('async');
var BotWrapper = require(global.src('bot-wrapper'));
var Game = require(global.src('game'));
var Library = require(global.src('library'));
var localeval = require(global.src('evaluate'));
var process = require('process');
var evaluatePrefix = require('fs').readFileSync(global.pluginsrc('overrun', './evaluate-prefix.js'), 'utf8');

const BOARD_SIZE = 6;
const TURN_COUNT = 40;
const ROUND_COUNT = 2;
const MAX_ACTION_AMOUNT = 4;

const EVAL_TIMEOUT = 500;
const MAX_CALLABLE = 1024;

const START_POS = {
	0: new Library.AABB(new Library.Position(0, 0), new Library.Position(1, 1)),
	1: new Library.AABB(new Library.Position(BOARD_SIZE - 1, BOARD_SIZE - 1), new Library.Position(BOARD_SIZE, BOARD_SIZE))
};

const GAME_NAME = 'OVERRUN';

class OverrunGame extends Game{
	constructor(gid, bot1, bot2, players, server){
		super(gid, bot1, bot2, players, server);
		this.bots = [new BotWrapper(bot1), new BotWrapper(bot2)];

		this.round = 0;
		this.turn = 0;
		this.attack = 0;

		this.roundTick = 0;
		this.gameLog = [];
		this.gameName = GAME_NAME;
	}

	getName(){
		return this.gameName;
	}

	getBattleId(){
		return this.battleId;
	}

	resetRound(){
		this.bots.forEach((v, k) => {
			v.boundBox = START_POS[k] || START_POS[0];
		});
	}

	processRound(attackIndex, roundCallback){
		this.resetRound();

		this.bots.forEach((v) => {
			v.metadata.overallMovement = TURN_COUNT * 2;
		});

		var turnLog = {};
		var attack = this.bots[attackIndex];
		var defence = this.bots.filter((bot, index) => {
			return index !== attackIndex;
		})[0];

		async.eachSeries(Array.rangeOf(TURN_COUNT), (i, cb) => {
			if(turnLog[i] === undefined){
				turnLog[i] = [];
			}

			attack.metadata.currentMovement = MAX_ACTION_AMOUNT;
			var attackEvaluator = this.getEvaluator(attack, []);

			localeval(evaluatePrefix.replace('"code";', attack.getCode()), {
				enemy: {
						name: defence.getName(),
						x: defence.boundBox.minX(),
						y: defence.boundBox.minY(),
						overallMovement: defence.metadata.overallMovement,
						currentMovement: defence.metadata.currentMovement
					},

				x: attack.boundBox.minX(),
				y: attack.boundBox.minY(),
				yaw: attack.yaw,
				turn: i + 1,
				overallMovement: attack.metadata.overallMovement,
				currentMovement: attack.metadata.currentMovement,
				isDefence: false

			}, EVAL_TIMEOUT, (err, val) => {
				try{
					val = JSON.parse(val);
				}catch(exception){
					val = [];
				}

				if(val.length < MAX_CALLABLE){
					val.forEach((callableObject) => {
						Function.prototype.apply.apply((attackEvaluator.evaluator[callableObject.name] || () => {}), [
							{},
							callableObject.arguments
						]);
					});
				}

				turnLog[i].push({
					content: 'overrun.turn.change',
					data: {
						type: 'attack',
						name: attack.getName(),
						skin: attack.getSkin(),
						player: attack.getPlayer().getName(),
						log: attackEvaluator.logs,
						err: err ? err.toString() : undefined
					}
				});

				//deepEqual is okay because this moves on 5*5 grid and size of bots are same
				if(attack.boundBox.min().deepEqual(defence.boundBox.min())){
					if(defence.defence !== undefined && defence.defence > 0){
						turnLog[i].push({
							content: 'overrun.turn.defence'
						});
						return;
					}

					turnLog.final = {
						content: 'overrun.turn.win',
						data: {
							type: 'attack',
							player: bot.getPlayer().getName(),
							bot: bot.getName()
						}
					};
					cb(new Error());
					return;
				}

				if(defence.defence !== undefined && defence.defence > 0){
					defence.defence--;
				}

				defence.metadata.currentMovement = MAX_ACTION_AMOUNT + 1;
				var defenceEvaluator = this.getEvaluator(defence, [], true);

				localeval(evaluatePrefix.replace('"code";', defence.getCode()), {
					enemy: {
							name: attack.getName(),
							x: attack.boundBox.minX(),
							y: attack.boundBox.minY(),
							overallMovement: attack.metadata.overallMovement,
							currentMovement: attack.metadata.currentMovement
						},

					x: defence.boundBox.minX(),
					y: defence.boundBox.minY(),
					yaw: defence.yaw,
					turn: i + 1,
					overallMovement: defence.metadata.overallMovement,
					currentMovement: defence.metadata.currentMovement,
					isDefence: true

				}, EVAL_TIMEOUT, (err, val) => {
					try{
						val = JSON.parse(val);
					}catch(exception){
						val = [];
					}

					if(val.length < MAX_CALLABLE){
						val.forEach((callableObject) => {
							Function.prototype.apply.apply((defenceEvaluator.evaluator[callableObject.name] || () => {}), [
								{},
								callableObject.arguments
							]);
						});
					}

					turnLog[i].push({
						content: 'overrun.turn.change',
						data: {
							type: 'defence',
							name: defence.getName(),
							skin: defence.getSkin(),
							log: defenceEvaluator.logs,
							err: err ? err.toString() : undefined
						}
					});

					cb(null);
				});
			});
		}, (err) => {
			if(!err){
				turnLog.final = {
					content: 'overrun.turn.win',
					data: {
						type: 'defence',
						player: defence.getPlayer().getName(),
						bot: defence.getName()
					}
				};
			}

			roundCallback(turnLog);
		});
	}

	start(){
		var gameLog = [];
		async.eachSeries(Array.rangeOf(TURN_COUNT), (k, cb) => {
			this.processRound((k % 2), (log) => {
				gameLog[k] = log;
				cb(null);
			});
		}, (e) => {
			this.gameLog = gameLog;
			this.players.forEach((v) => {
				v.gameEnd();
			});

			process.nextTick(() => {
				this.handleWin(gameLog, (afterHandle) => {
					if(!afterHandle) return;

					this.server.removeGame(this.gameId);
					var date = new Date();

					global.mongo
					.collection(global.config['collection-battle'])
					.insertOne({
						id: this.battleId,
						players: this.players.map((v) => v.getName()),
						date: date.getMilliseconds(),
						dateTime: Date.now(),
						log: gameLog,
						type: 'OVERRUN'
					});
				});
			});
		});
	}

	getEvaluator(bot, logObject, isDefence){
		var check = (amount) => {
			if(bot.metadata.currentMovement - amount < 0) return 'turn.no.movement';
			if(bot.metadata.overallMovement - amount < 0) return 'turn.no.movement.overall';

			return undefined;
		};

		var customLog = 0;
		var log = (content, data, isCustom) => {
			if(isCustom){
				if((customLog < 64 && typeof data === 'string') && data.length < 256){
					customLog++;
					logObject.push({
						content: content,
						data: data
					});
				}
				return;
			}

			logObject.push({
				content: content,
				data: data
			});
		};

		var evalObject = {
			log: function(content){
				if(typeof content !== 'string'){
					log('turn.err', 'turn.content.not.string', true);
					return false;
				}

				log('turn.text', content, true);
				return true;
			},

			move: function(){
				var err = check(1);

				if((bot.getBoundBox().maxX() >= BOARD_SIZE || bot.getBoundBox().minX() <= 0) || (bot.getBoundBox().maxY() >= BOARD_SIZE || bot.getBoundBox().minY() <= 0)){
					err = 'turn.bot.over.board';
				}

				if(err){
					log('turn.err', err, true);
					return false;
				}
				bot.metadata.currentMovement--;
				bot.metadata.overallMovement--;
				bot.move();
				log('turn.move');
				return true;
			},

			rotate: function(amount){
				var err = check(1);
				if(!Number.isInteger(amount) || !isFinite(amount)){
					err = 'turn.amount.not.number';
				}else if(amount % 90 !== 0){
					err = 'turn.amount.not.90';
				}

				if(err){
					log('turn.err', err, true);
					return false;
				}

				bot.metadata.currentMovement--;
				bot.metadata.overallMovement--;
				bot.yaw += amount % 360;
				log('turn.rotate', amount);
				return true;
			}
		};

		if(isDefence){
			evalObject.defence = function(){
				var err = check(6);
				if(err){
					log('turn.err', err, true);
				}

				bot.metadata.defence = 2;
				bot.metadata.currentMovement -= 6;
				bot.metadata.overallMovement -= 6;
				log('turn.defence');
			};
		}

		return {
			evaluator: evalObject,
			logs: logObject //call-by-reference
		};
	}

	handleWin(gameLog, cb){
		cb(true);
	}
}

OverrunGame.getName = () => {
	return GAME_NAME;
};

module.exports = {
	game: OverrunGame,
	api: {
		name: 'OVERRUN-',
		content: {
			title: global.translator('plugin.overrun.api.title'),
			content: ['log', 'enemy', 'status', 'move', 'rotate', 'defence'].map((v) => {
				return {
					title: global.translator(`plugin.overrun.api.${v}.title`),
					content: global.translator(`plugin.overrun.api.${v}.content`)
				};
			})
		}
	}
};
