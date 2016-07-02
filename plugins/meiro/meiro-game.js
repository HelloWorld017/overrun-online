'use strict';
var async = require('async');
var BotWrapper = require(global.src('bot-wrapper'));
var Game = require(global.src('game'));
var Library = require(global.src('library'));
var localeval = require('./meiro-evaluator');
var process = require('process');

var evaluatePrefix = require('fs').readFileSync(global.pluginsrc('meiro', './evaluate-prefix.js'), 'utf8');

const GAME_NAME = "MEIRO";

const START_X = 0;
const START_Y = 0;
const MAZE_SIZE = 10;
const END_X = MAZE_SIZE - 1;
const END_Y = MAZE_SIZE - 1;

const TURN_COUNT = 60;
const ROUND_COUNT = 1;

const TRAP_COUNT = 1;
const TELEPORTER_COUNT = 3;
const WALLCUTTER_COUNT = 2;

const EVAL_TIMEOUT = 500;
const MAX_SAVE_LENGTH = 10000;

class Direction{
	constructor(x, y, value, left, right, opposite){
		this.x = x;
		this.y = y;
		this.value = value;
		this.left = left;
		this.right = right;
		this.opposite = opposite;
	}
}

const DIRECTIONS = [
	new Direction(0, -1, 'N', 'W', 'E', 'S'),
	new Direction(-1, 0, 'W', 'S', 'N', 'E'),
	new Direction(1, 0, 'E', 'N', 'S', 'W'),
	new Direction(0, 1, 'S', 'E', 'W', 'N')
];

const DIRECTIONS_BY_VALUE = {
	N: DIRECTIONS[0],
	W: DIRECTIONS[1],
	E: DIRECTIONS[2],
	S: DIRECTIONS[3]
}

class Tile{
	constructor(x, y){
		this.x = x;
		this.y = y;
		this.walls = {};
		this.visited = false;
		this.placedObjects = {};

		DIRECTIONS.forEach((v) => {
			this.walls[v.value] = true;
		});
	}

	placeObject(objectName, data){
		this.placedObjects[objectName] = data;
		return this;
	}

	isPlaced(objectName){
		if(objectName === undefined) return (Object.keys(this.placedObjects).length !== 0);
		return (this.placedObjects[objectName] === undefined);
	}
}

class MeiroGame extends Game{
	constructor(gid, bot1, bot2, players, server){
		super(gid, bot1, bot2, players, server);
		this.bots = [new BotWrapper(bot1), new BotWrapper(bot2)];

		this.round = 0;
		this.turn = 0;

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
		//DONE:0 generate maze, generate teleporter
		this.maze = {
			tiles: {},
			teleporters: {}
		};

		//Using recursive backtracking to generate a maze;
		Array.rangeOf(MAZE_SIZE).forEach((x) => {
			Array.rangeOf(MAZE_SIZE).forEach((y) => {
				this.maze.tiles[`x${x}y${y}`] = new Tile(x, y);
			});
		});

		var carve = (x, y) => {
			var direction = Array.shuffle(DIRECTIONS);

			direction.forEach((d) => {
				var newX = x + d.x;
				var newY = y + d.y;

				if(newX >= 0 && newY >= 0 && newX < MAZE_SIZE && newY < MAZE_SIZE && (this.maze.tiles[`x${newX}y${newY}`].visited === false)){
					this.maze.tiles[`x${x}y${y}`].walls[d.value] = false;
					this.maze.tiles[`x${newX}y${newY}`].walls[d.opposite] = false;
					this.maze.tiles[`x${newX}y${newY}`].visited = true;
					carve(newX, newY);
				}
			});
		};

		carve(START_X, START_Y);

		Array.rangeOf(TELEPORTER_COUNT).forEach((i) => {
			this.getRandomUnplacedPosition((start) => {
				if(start === undefined) return;
				start.placeObject('teleport', i);

				this.getRandomUnplacedPosition((end) => {
					if(end === undefined){
						start.placedObjects.teleport = undefined;
						return;
					}

					end.placeObject('teleport', i);
					this.maze.teleporters[i] = [start, end];
				});
			});
		});

		Array.rangeOf(WALLCUTTER_COUNT).forEach((i) => {
			this.getRandomUnplacedPosition((pos) => {
				if(pos === undefined) return;

				pos.placeObject('wallcutter', true);
			});
		});

		Array.rangeOf(TRAP_COUNT).forEach((i) => {
			this.getRandomUnplacedPosition((pos) => {
				if(pos === undefined) return;
				pos.placeObject('trap', true);
			});
		});

		this.bots.forEach((v, k) => {
			v.metadata.x = START_X;
			v.metadata.y = START_Y;
			v.metadata.direction = DIRECTIONS_BY_VALUE.N;
			v.metadata.items = [];
			v.metadata.usedTeleporter = [];
			v.metadata.saveData = undefined;
		});
	}

	getRandomPosition(){
		return `x${Math.randomRange(MAZE_SIZE - 1, 0)}y${Math.randomRange(MAZE_SIZE -1, 0)}`;
	}

	getRandomUnplacedPosition(cb){
		async.filter(this.maze.tiles, (tile, callback) => {
			callback(!tile.isPlaced());
		}, (res) => {
			cb(Array.random(res));
		});
	}

	getPlayerByName(name, callback){
		async.each(this.players, (v, cb) => {
			if(v.getName() === name){
				cb(v);
			}
		}, (player) => {
			callback(player);
		});
	}

	processRound(roundCallback){
		this.resetRound();

		var turnLog = {};

		var tiles = Object.keys(this.maze.tiles).reduce((prev, curr) => {
			prev[curr] = {
				walls: this.maze.tiles[curr].walls,
				placedObjects: this.maze.tiles[curr].placedObjects
			};

			return prev;
		}, {});

		turnLog.init = {
			content: 'turn.start',
			data: {
				type: 'meiro',
				maze: {
					tiles: tiles,
					teleporters: this.maze.teleporters
				},
				start: {
					x: START_X,
					y: START_Y
				},
				size: MAZE_SIZE,
				players: this.bots.map(function(v){
					return {
						name: v.getName(),
						skin: global.skin(v.getSkin()),
						player: v.getPlayer().getName()
					}
				}),
			}
		};

		async.eachSeries(Array.rangeOf(TURN_COUNT), (i, cb) => {
			if(turnLog[i] === undefined){
				turnLog[i] = [];
			}

			this.bots.forEach((v) => {
				v.metadata.moveerr = false;
				v.metadata.checkedWall = false;
			});

			var setToDefault = (metadata) => {
				return {
					maze: this.maze,
					bot: metadata,
					logObject: [{
						content: 'turn.err.runtime',
						data: {}
					}]
				};
			};

			var callbackCalled = false;
			localeval(evaluatePrefix, {
				code: this.bots[0].getCode(),
				maze: JSON.stringify(this.maze),
				bot: JSON.stringify(this.bots[0].metadata),
				startX: START_X,
				startY: START_Y,
				saveLength: MAX_SAVE_LENGTH
			}, EVAL_TIMEOUT, (err, logs) => {
				if(callbackCalled) return;
				callbackCalled = true;
				try{
					logs = JSON.parse(logs);
				}catch(e){}

				if(err || !logs){
					if(typeof err === 'object') err.stack = undefined;
					logs = setToDefault(this.bots[0].metadata);
				}

				this.maze = logs.maze;
				this.bots[0].metadata = logs.bot;
				this.bots[0].metadata.direction = DIRECTIONS_BY_VALUE[this.bots[0].metadata.direction.value];

				var sCallbackCalled = false;
				localeval(evaluatePrefix, {
					code: this.bots[1].getCode(),
					maze: JSON.stringify(this.maze),
					bot: JSON.stringify(this.bots[1].metadata),
					startX: START_X,
					startY: START_Y,
					saveLength: MAX_SAVE_LENGTH
				}, EVAL_TIMEOUT, (err1, logs1) => {
					if(sCallbackCalled) return;
					sCallbackCalled = true;

					try{
						logs1 = JSON.parse(logs1);
					}catch(e){}

					if(err1 || !logs1){
						if(typeof err1 === 'object') err1.stack = undefined;
						logs1 = setToDefault(this.bots[1].metadata);
					}

					this.maze = logs1.maze;
					this.bots[1].metadata = logs1.bot;
					this.bots[1].metadata.direction = DIRECTIONS_BY_VALUE[this.bots[1].metadata.direction.value];

					turnLog[i].push({
						content: 'meiro.turn.proceed',
						data: [{
							name: this.bots[0].getName(),
							skin: this.bots[0].getSkin(),
							player: this.bots[0].getPlayer().getName(),
							log: logs.logObject,
							err: err ? JSON.stringify(err) : undefined
						}, {
							name: this.bots[1].getName(),
							skin: this.bots[1].getSkin(),
							player: this.bots[1].getPlayer().getName(),
							log: logs1.logObject,
							err: err1 ? JSON.stringify(err1) : undefined
						}]
					});

					var endedBot = this.bots.filter((bot) => {
						return bot.metadata.x === END_X && bot.metadata.y === END_Y;
					});

					switch(endedBot.length){
						case 1:
							turnLog.final = {
								content: 'turn.win',
								data: {
									player: endedBot[0].getPlayer().getName(),
									bot: endedBot[0].getName(),
									escaped: true
								}
							};
							break;
						case 2:
							turnLog.final = {
								content: 'turn.draw',
								data: {
									player: [endedBot[0].getPlayer().getName(), endedBot[1].getPlayer().getName()],
									bot: [endedBot[0].getName(), endedBot[1].getName()],
									escaped: true
								}
							};
							break;
					}

					if(endedBot.length > 0){
						cb({});
						return;
					}

					cb(null);
				});
			});
		}, (err) => {
			if(turnLog.final === undefined){
				turnLog.final = {
					content: 'turn.draw',
					data: {
						player: [this.bots[0].getPlayer().getName(), this.bots[1].getPlayer().getName()],
						bot: [this.bots[0].getName(), this.bots[1].getName()],
						escaped: false
					}
				};
			}

			roundCallback(turnLog);
		});
	}

	start(){
		var gameLog = [];
		async.eachSeries(Array.rangeOf(ROUND_COUNT), (k, cb) => {
			this.processRound((log) => {
				gameLog[k] = log;
				cb(null);
			});
		}, (e) => {
			this.gameLog = gameLog;
			this.players.forEach((v) => {
				v.gameEnd();
			});

			process.nextTick(() => {
				var score = {};
				this.players.forEach((v) => {
					score[v.getName()] = 0;
				});

				async.each(gameLog, (v, cb) => {
					if(typeof v.final.data.player === 'object'){
						v.final.data.player.forEach((v1) => {
							score[v1]++;
						});
						cb();
						return;
					}

					score[v.final.data.player]++;
					cb();
				}, () => {
					this.handleWin(gameLog, (afterHandle) => {
						if(!afterHandle) return;
						this.server.removeGame(this.gameId);
						var date = new Date();
						var bots = {};
						async.each(this.bots, (v, cb) => {
							bots[v.getPlayer().getName()] = {
								skin: global.skin(v.getSkin()),
								name: v.getName()
							};
							cb();
						}, () => {
							global.mongo
								.collection(global.config['collection-battle'])
								.insertOne({
									id: this.battleId,
									players: this.players.map((v) => v.getName()),
									bots: bots,
									score: score,
									date: date.getMilliseconds(),
									dateTime: Date.now(),
									log: gameLog,
									type: 'MEIRO'
								});
						});
					}, score);
				});
			});
		});
	}

	handleWin(gameLog, cb){
		cb(true);
	}
}

MeiroGame.getName = () => {
	return GAME_NAME;
};

module.exports = {
	game: MeiroGame
};
