'use strict';
var Player = require('./player');
var Library = require('./library');
var localeval = require('localeval');

const BOARD_SIZE = 5;
const TURN_COUNT = 40;
const ROUND_COUNT = 4;
const MAX_ACTION_AMOUNT = 4;

const EVAL_TIMEOUT = 50;

const START_POS = {
	0: new Library.AABB(new Library.Position(0, 0), new Library.Position(1, 1)),
	1: new Library.AABB(new Library.Position(BOARD_SIZE - 1, BOARD_SIZE - 1), new Library.Position(BOARD_SIZE, BOARD_SIZE))
}

class OverrunGame{

	/**
	 * constructor - constructor
	 *
	 * @param  Bot bot1    description
	 * @param  Bot bot2    description
	 * @param  Player[] players description
	 */
	constructor(bot1, bot2, players){
		this.players = players;
		this.bots = [new BotWrapper(bot1), new BotWrapper(bot2)];

		this.round = 0;
		this.turn = 0;
		this.attack = 0;

		this.roundTick = 0;
		resetRound();
	}

	resetRound(){
		this.bots.forEach((v, k) => {
			v.boundBox = START_POS[k] || START_POS[0];
		});
	}

	processRound(){
		bots.forEach((v) => {
			v.metadata.overallMovement = TURN_COUNT * 2;
		});

		var turnLog = {};

		async.eachSeries(Library.rangeOf(TURN_COUNT), (i, cb) => {
			if(turnLog[i] === undefined){
				turnLog[i] = [];
			}

			var attack = this.bots[this.attack];
			attack.metadata.currentMovement = MAX_ACTION_AMOUNT;
			var attackEvaluator = this.getEvaluator(attack, []);

			localeval(attack.code, attackEvaluator.evaluator, EVAL_TIMEOUT, (err) => {
				turnLog[i].push({
					content: 'turn.change',
					data: {
						type: 'attack',
						name: attack.name,
						skin: attack.skin,
						log: attackEvaluator.logs,
						err: err ? err.toString() : undefined
					}
				});

				//deepEqual is okay because this moves on 5*5 grid and size of bots are same
				if(attack.boundBox.deepEqual(defece.boundBox)){
					turnLog.final = {
						content: 'turn.attack.win'
					};
					cb(new Error());
					return;
				}

				var defence = this.bots.filter((bot, index) => {
					return index !== attack;
				})[0];

				if(defence.defence !== undefined && defence.defence > 0){
					defence.defence--;
				}

				defence.metadata.currentMovement = MAX_ACTION_AMOUNT + 1;
				var defenceEvaluator = this.getEvaluator(attack, [], true);
				localeval(defence.code, defenceEvaluator.evaluator, EVAL_TIMEOUT, (err) => {
					turnLog[i].push({
						content: 'turn.change',
						data: {
							type: 'defence',
							name: defence.name,
							skin: defence.skin,
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
					content: 'turn.defence.win'
				};
			}

			this.players.forEach((v) => {
				v.getPlayer().getSocket().emit('simulate', turnLog);
			});
		});
	}

	getPlayerByName(name){
		return this.players[name];
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
				if((customLog < 128 && typeof data === 'string') && data.length < 256){
					customLog++;
					logObject.push({
						content: 'turn.text',
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
			rotate: function(amount){
				var err = check(1);
				if(Number.isInteger(amount)){
					err = new Error('turn.amount.not.number');
				}

				if(err){
					log('turn.err', err, true);
					return;
				}

				bot.metadata.currentMovement--;
				bot.metadata.overallMovement--;
				bot.yaw += amount;
				log('turn.rotate', amount);
			},

			log: function(content){
				if(typeof content !== 'string'){
					log('turn.err', new Error('turn.content.not.string'), true);
				}

				log(turn, content);
			},

			move: function(){
				var err = check(1);
				if(err){
					log('turn.err', err, true);
					return;
				}

				bot.metadata.currentMovement--;
				bot.metadata.overallMovement--;
				bot.move();
				log(i, 'turn.move');
			},

			status: function(){
				return {
					'left-overall': bot.metadata.overallMovement,
					'left-current': bot.metadata.currentMovement,
					'turn': turn
				}
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
			};
		}

		return {
			evaluator: evalObject,
			logs: logObject //call-by-reference
		};
	}

	handleWin(turnLog){
		
	}
}
