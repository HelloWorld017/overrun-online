'use strict';
const START_X = 0;
const START_Y = 0;

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
		this.bots.forEach((v, k) => {
			v.metadata.x = START_X;
			v.metadata.y = START_Y;
		});
	}

	processRound(roundCallback){
		resetRound();

		var turnLog = {};
		var attack = this.bots[0];

		async.eachSeries(Library.rangeOf(TURN_COUNT), (i, cb) => {
			if(turnLog[i] === undefined){
				turnLog[i] = [];
			}

			localeval(attack.getCode(), this.getEvaluator(, []), EVAL_TIMEOUT, (err) => {
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

OverrunGame.getName = () => {
	return GAME_NAME;
};
