'use strict';
var async = require('async');
var Library = require(global.src('library'));
var Game = require(global.src('game'));
var localeval = require(global.src('evaluate'));

const GAME_NAME = "MEIRO";
const START_X = 0;
const START_Y = 0;
const MAZE_SIZE = 10;
const TELEPORTER_COUNT = 3;
const WALLCUTTER_COUNT = 2;

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
	new Direction(1, 0, 'W', 'S', 'N', 'E'),
	new Direction(-1, 0, 'E', 'N', 'S', 'W'),
	new Direction(0, -1, 'S', 'E', 'W', 'N')
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
		super();
		this.bots = [new BotWrapper(bot1), new BotWrapper(bot2)];

		this.round = 0;
		this.turn = 0;

		this.roundTick = 0;
		this.gameLog = [];
		this.gameName = GAME_NAME;

		resetRound();
	}

	getName(){
		return this.gameName;
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

				if(newX >= 0 && newY >= 0 && newX < MAZE_SIZE && newY < MAZE_SIZE && (this.maze[`x${newX}y${newY}`].visited === false)){
					this.maze.tiles.[`x${x}y${y}`].walls[d.value] = false;
					this.maze.tiles.[`x${newX}y${newY}`].walls[d.opposite] = false;
					this.maze.tiles[`x${newX}y${newY}`].visited = true;
					carve(newX, newY);
				}
			});
		};

		carve(START_X, START_Y);

		Array.rangeOf(TELEPORTER_COUNT).forEach((i) => {
			getRandomUnplacedPosition((start) => {
				if(start === undefined) return;
				start.placeObject('teleport', i);

				getRandomUnplacedPosition((end) => {
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
			getRandomUnplacedPosition((pos) => {
				if(pos === undefined) return;

				pos.placeObject('wallcutter', true);
			});
		});

		this.bots.forEach((v, k) => {
			v.metadata.x = START_X;
			v.metadata.y = START_Y;
			v.metadata.direction = DIRECTIONS_BY_VALUE.N;
			v.metadata.items = [];
		});
	}

	getRandomPosition(){
		return `x${Math.randomRange(MAZE_SIZE - 1, 0)}y${Math.randomRange(MAZE_SIZE -1, 0)}`;
	}

	getRandomUnplacedPosition(cb){
		async.filter(this.maze.tiles, (tile, callback) => {
			callback(!tile.isPlaced());
		}, (err, res) => {
			cb(Array.random(res));
		});
	}

	processRound(roundCallback){
		resetRound();

		var turnLog = {};

		var tiles = Object.keys(this.maze.tiles).reduce((prev, curr) => {
			prev[curr] = {
				walls: this.maze.tiles[curr],
				placedObjects: this.maze.placedObjects
			};

			return prev;
		});

		turnLog.init = {
			content: 'turn.start',
			data: {
				type: 'meiro',
				maze: {
					tiles: tiles,
					teleporters: this.maze.teleporters
				}
			}
		};

		async.eachSeries(Array.rangeOf(TURN_COUNT), (i, cb) => {
			if(turnLog[i] === undefined){
				turnLog[i] = [];
			}

			var evaluators = [];
			evaluators[0] = this.getEvaluator(bots[0], []);
			evaluators[1] = this.getEvaluator(bots[1], []);

			bots.forEach((v) => {
				v.metadata.moveerr = false;
				v.metadata.checkedWall = false;
			});

			localeval(bots[0].getCode(), evaluators[0].evaluator, EVAL_TIMEOUT, (err) => {
				localeval(defence.getCode(), evaluators[1].evaluator, EVAL_TIMEOUT, (err1) => {
					turnLog[i].push({
						content: 'meiro.turn.proceed',
						data: [{
							name: bots[0].getName(),
							skin: bots[0].getSkin(),
							player: bots[0].getPlayer().getName(),
							log: evaluators[0].logs,
							err: err ? err.toString() : undefined
						}, {
							name: bots[1].getName(),
							skin: bots[1].getSkin(),
							player: bots[1].getPlayer().getName(),
							log: evaluators[1].logs,
							err: err1 ? err1.toString() : undefined
						}]
					});
					//TODO:80 check bots escaping maze.

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

			process.nextTick(() => {
				handleWin(gameLog, (afterHandle) => {
					if(!afterHandle) return;

					this.server.removeGame(this.gameId);
					var date = new Date();

					global.mongo
					.collection(global.config['collection-battle'])
					.insertOne({
						id: this.battleId,
						players: [p1.getName(), p2.getName()],
						date: date.getMilliseconds(),
						log: gameLog,
					});
				});
			});
		});
	}

	getEvaluator(bot, logObject){
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
			log: (content) => {
				if(typeof content !== 'string'){
					log('turn.err', 'turn.content.not.string', true);
					return false;
				}

				log('turn.text', content, true);
				return true;
			},

			turnLeft: () => {
				bot.metadata.direction = DIRECTION_BY_VALUE[bot.metadata.direction.left];
				log('turn.left');
			},

			turnRight: () => {
				bot.metadata.direction = DIRECTION_BY_VALUE[bot.metadata.direction.right];
				log('turn.right');
			},

			move: () => {
				if(this.maze[`x${bot.metadata.x}y${bot.metadata.y}`].walls[bot.metadata.direction.value] && !bot.metadata.moveerr){
					log('turn.move.over.wall');
					bot.metadata.moveerr = true;
					bot.metadata.x = START_X;
					bot.metadata.y = START_Y;
					return false;
				}

				bot.move();
				log('turn.move');
				return true;
			},

			carveWall: () => {
				if(bot.metadata.items.indexOf('wallcutter') === -1){
					log('turn.err', 'turn.carve.fail', true);
					return false;
				}

				Array.remove(bot.metadata.items, bot.metadata.items.indexOf('wallcutter'));
				DIRECTIONS.forEach((v) => {
					this.maze[`x${bot.metadata.x}y${bot.metadata.y}`].walls[v.value] = false;
					this.maze[`x${bot.metadata.x + v.x}y${bot.metadata.y + v.y}`].walls[v.opposite] = false;
				});

				return true;
			},

			checkWall: () => {
				if(bot.metadata.checkedWall){
					log('turn.err', 'turn.already.checked', true);
					return false;
				}


			}
		};

		return {
			evaluator: evalObject,
			logs: logObject //call-by-reference
		};
	}

	handleWin(gameLog, cb){
		cb(true);
	}
}

MeiroGame.getName = () => {
	return GAME_NAME;
};
