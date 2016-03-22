'use strict';
var Player = require('./player');
var Library = require('./library');
var localeval = require('localeval');

const BOARD_SIZE = 6;
const TURN_COUNT = 40;
const ROUND_COUNT = 2;
const MAX_ACTION_AMOUNT = 4;

const EVAL_TIMEOUT = 50;

const START_POS = {
	0: new Library.AABB(new Library.Position(0, 0), new Library.Position(1, 1)),
	1: new Library.AABB(new Library.Position(BOARD_SIZE - 1, BOARD_SIZE - 1), new Library.Position(BOARD_SIZE, BOARD_SIZE))
};

class OverrunGame{
	constructor(gid, bot1, bot2, players, server){
		this.gameId = gid;
		this.players = players;
		this.bots = [new BotWrapper(bot1), new BotWrapper(bot2)];
		this.server = server;

		this.round = 0;
		this.turn = 0;
		this.attack = 0;

		this.roundTick = 0;
		this.gameLog = [];
		this.gameName = "OVERRUN";
		resetRound();
	}

	getName(){
		return this.gameName;
	}

	resetRound(){
		this.bots.forEach((v, k) => {
			v.boundBox = START_POS[k] || START_POS[0];
		});
	}

	processRound(attackIndex, roundCallback){
		resetRound();

		bots.forEach((v) => {
			v.metadata.overallMovement = TURN_COUNT * 2;
		});

		var turnLog = {};
		var attack = this.bots[attackIndex];
		var defence = this.bots.filter((bot, index) => {
			return index !== attackIndex;
		})[0];

		async.eachSeries(Library.rangeOf(TURN_COUNT), (i, cb) => {
			if(turnLog[i] === undefined){
				turnLog[i] = [];
			}

			attack.metadata.currentMovement = MAX_ACTION_AMOUNT;
			var attackEvaluator = this.getEvaluator(attack, []);

			localeval(attack.getCode(), attackEvaluator.evaluator, EVAL_TIMEOUT, (err) => {
				turnLog[i].push({
					content: 'turn.change',
					data: {
						type: 'attack',
						name: attack.getName(),
						skin: attack.getSkin(),
						log: attackEvaluator.logs,
						err: err ? err.toString() : undefined
					}
				});

				//deepEqual is okay because this moves on 5*5 grid and size of bots are same
				if(attack.boundBox.min().deepEqual(defece.boundBox.min())){
					if(defence.defence !== undefined && defence.defence > 0){
						turnLog[i].push({
							content: 'turn.defence'
						});
						return;
					}

					turnLog.final = {
						content: 'turn.win',
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
				var defenceEvaluator = this.getEvaluator(attack, [], true);

				localeval(defence.getCode(), defenceEvaluator.evaluator, EVAL_TIMEOUT, (err) => {
					turnLog[i].push({
						content: 'turn.change',
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
					content: 'turn.win',
					data: {
						type: 'defence',
						player: bot.getPlayer().getName(),
						bot: bot.getName()
					}
				};
			}

			roundCallback(turnLog);
		});
	}

	start(){
		var gameLog = [];
		async.eachSeries(Library.rangeOf(TURN_COUNT), (k, cb) => {
			processRound((k % 2), (log) => {
				gameLog[k] = log;
				cb(null);
			});
		}, (e) => {
			this.gameLog = gameLog;
			this.players.forEach((v) => {
				v.gameEnd();
			});

			handleWin(gameLog);
		)};
	}

	getEvaluator(bot, logObject, isDefence){
		var check = (amount) => {
			if(player.metadata.currentMovement - amount < 0) return new Error('turn.no.movement');
			if(player.metadata.overallMovement - amount < 0) return new Error('turn.no.movement.overall');

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
					log('turn.err', new Error('turn.content.not.string'), true);
					return false;
				}

				log('turn.text', content, true);
				return true;
			},

			move: function(){
				var err = check(1);

				if((bot.getBoundBox().maxX() >= BOARD_SIZE || bot.getBoundBox().minX() <= 0) || (bot.getBoundBox().maxY() >= BOARD_SIZE || bot.getBoundBox().minY() <= 0)){
					err = new Error('turn.bot.over.board');
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
				if(Number.isInteger(amount)){
					err = new Error('turn.amount.not.number');
				}

				if(err){
					log('turn.err', err, true);
					return false;
				}

				bot.metadata.currentMovement--;
				bot.metadata.overallMovement--;
				bot.yaw += amount;
				log('turn.rotate', amount);
				return true;
			},

			status: function(){
				return {
					'left-overall': bot.metadata.overallMovement,
					'left-current': bot.metadata.currentMovement,
					'turn': turn
				};
			},

			getBots: function(){
				return game.bot.map((v) => {
					return {
						name: v.getName(),
						x: v.boundBox.minX(),
						y: v.boundBox.minY(),
						overallMovement: v.metadata.overallMovement,
						currentMovement: v.metadata.currentMovement
					};
				});
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

	handleWin(gameLog){

	}
}

module.exports = OverrunGame;
