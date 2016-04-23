'use strict';
var Library = require(global.src('library'));

const GAME_NAME = "MEIRO";
const START_X = 0;
const START_Y = 0;
const MAZE_SIZE = 10;

const DIRECTIONS = [
	{
		//EAST
		x: -1,
		y: 0,
		value: 'E',
		opposite: 'W'
	},
	{
		//WEST
		x: 1,
		y: 0,
		value: 'W',
		opposite: 'E'
	},
	{
		//NORTH
		x: 0,
		y: -1,
		value: 'N',
		opposite: 'S'
	},
	{
		//SOUTH
		x: 0,
		y: 1,
		value: 'S',
		opposite: 'N'
	}
];

class MeiroGame extends Game{
	constructor(gid, bot1, bot2, players, server){
		super();
		this.bots = [new BotWrapper(bot1), new BotWrapper(bot2)];

		this.round = 0;
		this.turn = 0;

		this.roundTick = 0;
		this.gameLog = [];
		this.gameName = GAME_NAME;

		this.maze = {};
		resetRound();
	}

	getName(){
		return this.gameName;
	}

	resetRound(){
		//TODO generate maze, generate teleporter
		this.maze = {};

		//Using recursive backtracking to generate a maze;
		Array.rangeOf(MAZE_SIZE).forEach((x) => {
			Array.rangeOf(MAZE_SIZE).forEach((y) => {
				this.maze[`x${x}y${y}`] = {
					visited: false,
					walls: {
						N: true,
						W: true,
						S: true,
						E: true
					}
				};
			});
		});

		var carve = (x, y) => {
			var direction = Array.shuffle(DIRECTIONS);

			direction.forEach((d) => {
				var newX = x + d.x;
				var newY = y + d.y;

				if(newX >= 0 && newY >= 0 && newX < MAZE_SIZE && newY < MAZE_SIZE && (this.maze[`x${newX}y${newY}`].visited === false)){
					this.maze[`x${x}y${y}`].walls[d.value] = false;
					this.maze[`x${newX}y${newY}`].walls[d.opposite] = false;
					this.maze[`x${newX}y${newY}`].visited = true;
					carve(newX, newY);
				}
			});
		};

		carve(START_X, START_Y);

		this.bots.forEach((v, k) => {
			v.metadata.x = START_X;
			v.metadata.y = START_Y;
		});
	}

	processRound(roundCallback){
		resetRound();

		var turnLog = {};

		async.eachSeries(Array.rangeOf(TURN_COUNT), (i, cb) => {
			if(turnLog[i] === undefined){
				turnLog[i] = [];
			}

			var evaluators = [];
			evaluators[0] = this.getEvaluator(bots[0], []);
			evaluators[1] = this.getEvaluator(bots[1], []);

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
					//TODO check bots escaping maze.

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
			//TODO
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
