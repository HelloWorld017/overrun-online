'use strict';
var Player = require('./player');
var Library = require('./library');
var localeval = require('localeval');

const BOARD_SIZE = 5;

const STATUS_NOT_STARTED = -1;
const STATUS_TYPING_CODE = 0;
const STATUS_RUNNING_SIMULATION = 1;

const SIMULATE_TICK = 2400; //20 Tick = 1 Second.
const START_TICK = 100;
const CODE_TICK = 3600;

const TURN_COUNT = 5;
const MAX_ACTION_AMOUNT = 4;

const EVAL_TIMEOUT = 50;

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
		this.bots = [bot1, bot2];

		this.round = 0;
		this.turn = 0;
		this.attack = 0;

		this.bots[0].getBoundBox().minX(0).maxX(1).minY(0).maxY(1);
		this.bots[1].getBoundBox().minX(BOARD_SIZE - 1).maxX(BOARD_SIZE).minY(BOARD_SIZE - 1).maxY(BOARD_SIZE);
		this.status = STATUS_NOT_STARTED;
		this.roundTick = 0;
	}

	handlePacket(player, name, data){
		switch(name){
			case 'simulend':
				if(this.status === STATUS_RUNNING_SIMULATION) getPlayerByName(player.getName()).metadata['simulend'] = true;
				break;
		}
	}

	handleTick(){
		this.roundTick++;
		switch(this.status){
			case STATUS_NOT_STARTED:
				if(this.roundTick >= START_TICK){
					//TODO start game
				}
				break;

			case STATUS_TYPING_CODE:
				if(this.roundTick >= CODE_TICK){
					this.roundTick = 0;
					players.forEach((v) => {
						v.metadata.overallMovement = TURN_COUNT * 2;
					});

					var turnLog = {};

					var log = function(turn, content, arg){
						if(turnLog[turn] === undefined) turnLog[turn] = [];

						if(turnLog[turn].length < 1024){ //Prevents memory-hogging
							turnLog[turn].push(content);
						}
					};

					async.eachSeries(Library.rangeOf(TURN_COUNT), (i, cb) => {
						log(i, 'turn.attack');

						player[attack].metadata.currentMovement = MAX_ACTION_AMOUNT;
						localeval(player[attack].metadata.code, getEvalObject(players[attack], this, log, i), EVAL_TIMEOUT, (err) => {
							if(err){
								log(i, 'turn.attack.err', err.toString());
							}
							//TODO check is player is caught

							var anotherPlayer = getAnotherPlayer(attack);

							if(anotherPlayer.defence !== undefined && anotherPlayer.defence > 0){
								anotherPlayer.defence--;
							}

							anotherPlayer.metadata.currentMovement = MAX_ACTION_AMOUNT + 1;
							localeval(anotherPlayer.metadata.code, getEvalObject(anotherPlayer, this, log, i, true), EVAL_TIMEOUT, (err) => {
								log(i, 'turn.defence.err', err.toString());
								cb();
							});
						});
					}, () => {
						this.players.forEach((v) => {
							v.getPlayer().getSocket().emit('simulate', turnLog);
						});

						this.status = STATUS_RUNNING_SIMULATION;
					});
				}
				break;

			case STATUS_RUNNING_SIMULATION:
				var endSimulation = true;

				players.forEach((v) => {
					if(v.metadata.simulend !== true) endSimulation = false;
				});

				if(this.roundTick >= SIMULATE_TICK || endSimulation){
					roundTick = 0;
					players.forEach((v) => {
						v.metadata.simulend = false;
					});

					attack = getAnotherPlayer(attack).getName();
					this.status = STATUS_TYPING_CODE;
				}
				break;
		}
	}

	getPlayerByName(name){
		return this.players[name];
	}
}

function getAnotherPlayer(name){
	return anotherPlayer = this.players.filter((v) => {
		return v.getName() !== name;
	})[0];
}

function getEvalObject(player, game, log, turn, isDefence){
	var check = function(amount){
		if(player.metadata.currentMovement - amount < 0) return new Error('turn.no.movement');
		if(player.metadata.overallMovement - amount < 0) return new Error('turn.no.movement.overall');

		return undefined;
	};

	var evalObject = {
		rotate: function(amount){
			var err = check(1);
			if(Number.isInteger(amount)){
				err = new Error('turn.amount.not.number');
			}

			if(err){
				log(turn, err);
				return;
			}

			player.metadata.currentMovement--;
			player.metadata.overallMovement--;
			player.yaw += amount;
			log(i, 'turn.rotate', amount);
		},

		log: function(content){
			if(typeof content !== 'string'){
				log(turn, new Error('turn.content.not.string'));
			}

			log(turn, content);
		},

		move: function(){
			var err = check(1);
			if(err){
				log(turn, err);
				return;
			}

			player.metadata.currentMovement--;
			player.metadata.overallMovement--;
			player.move();
			log(i, 'turn.move');
		},

		status: function(){
			return {
				'left-overall': player.metadata.overallMovement,
				'left-current': player.metadata.currentMovement,
				'turn': turn
			}
		},

		getPlayers: function(){
			return game.players.map((v) => {
				return {
					name: v.getName(),
					x: v.getPlayer().boundBox.minX(),
					y: v.getPlayer().boundBox.minY(),
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
				log(turn, err);
			}

			player.metadata.defence = 2;
			player.metadata.currentMovement -= 6;
			player.metadata.overallMovement -= 6;
		}
	}

	return evalObject;
}
