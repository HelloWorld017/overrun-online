"use strict";
(function(botData, mazeData, START_X, START_Y, MAX_SAVE_LENGTH){
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
	};

	var bot = {
		metadata: botData
	};
	bot.metadata.direction = DIRECTIONS_BY_VALUE[bot.metadata.direction.value];
	bot.metadata.lastmove = '';

	var maze = mazeData.tiles;

	var logObject = [];

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

	var restartFromStart = () => {
		bot.metadata.moveerr = true;
		bot.metadata.x = START_X;
		bot.metadata.y = START_Y;
	};

	var maxMovement = 64;
	var currentMovement = 0;

	var check = () => {
		if(maxMovement < currentMovement){
			log('turn.err', 'turn.max.exceed', true);
			return true;
		}
		currentMovement++;
		return false;
	};

	vm.runInNewContext(code, {
		log: (content) => {
			if(typeof content !== 'string'){
				log('turn.err', 'turn.content.not.string', true);
				return false;
			}

			log('turn.text', content, true);
			return true;
		},

		turnLeft: () => {
			if(check()) return false;
			bot.metadata.direction = DIRECTIONS_BY_VALUE[bot.metadata.direction.left];
			log('turn.left');
		},

		turnRight: () => {
			if(check()) return false;
			bot.metadata.direction = DIRECTIONS_BY_VALUE[bot.metadata.direction.right];
			log('turn.right');
		},

		move: () => {
			if(check()) return false;
			if(bot.metadata.moveerr){
				log('turn.err', 'turn.cannot.move', true);
				return false;
			}

			var currentPosition = `x${bot.metadata.x}y${bot.metadata.y}`;
			var currentTile = maze[currentPosition];
			if(currentTile.placedObjects['wallcutter']){
				bot.metadata.items.push('wallcutter');
				currentTile.placedObjects['wallcutter'] = undefined;
				log('turn.wallcutter', currentPosition);
			}

			if(currentTile.placedObjects['trap']){
				restartFromStart();

				log('turn.trap', currentPosition);
				currentTile.placedObjects['trap'] = undefined;
				bot.metadata.lastmove = 'trap';
				return true;
			}

			var teleporterIndex = undefined;
			if((teleporterIndex = currentTile.placedObjects['teleporter']) !== undefined && bot.metadata.usedTeleporter.indexOf(teleporterIndex) === -1){
				var teleportTarget = mazeData.teleporters[teleporterIndex].filter(function(v){
					return (v.x !== bot.metadata.x) && (v.y !== bot.metadata.y);
				})[0];
				bot.metadata.x = teleportTarget.x;
				bot.metadata.y = teleportTarget.y;
				bot.metadata.usedTeleporter.push(teleporterIndex);
				log('turn.teleport', 'teleport' + teleporterIndex);
				bot.metadata.lastmove = 'teleport';
				return true;
			}

			if(currentTile.walls[bot.metadata.direction.value]){
				restartFromStart();
				log('turn.err', 'turn.move.over.wall', true);
				bot.metadata.lastmove = 'wall';
				return false;
			}

			bot.metadata.x += bot.metadata.direction.x;
			bot.metadata.y += bot.metadata.direction.y;
			log('turn.move');
			bot.metadata.lastmove = 'normal';
			return true;
		},

		carveWall: () => {
			if(bot.metadata.items.indexOf('wallcutter') === -1){
				log('turn.err', 'turn.carve.fail', true);
				return false;
			}

			Array.remove(bot.metadata.items, bot.metadata.items.indexOf('wallcutter'));
			DIRECTIONS.forEach((v) => {
				maze[`x${bot.metadata.x}y${bot.metadata.y}`].walls[v.value] = false;
				maze[`x${bot.metadata.x + v.x}y${bot.metadata.y + v.y}`].walls[v.opposite] = false;
			});

			log('turn.carve');

			return true;
		},

		x: () => {
			return bot.metadata.x;
		},

		y: () => {
			return bot.metadata.y;
		},

		direction: () => {
			return bot.metadata.direction.value;
		},

		checkWall: () => {
			if(bot.metadata.checkedWall){
				log('turn.err', 'turn.already.checked', true);
				return false;
			}
			var walls = maze[`x${bot.metadata.x}y${bot.metadata.y}`].walls;
			var numericWalls = 0;

			if(walls.N) numericWalls += 1;
			if(walls.W) numericWalls += 2;
			if(walls.E) numericWalls += 4;
			if(walls.S) numericWalls += 8;
			return numericWalls;
		},

		save: (data) => {
			if(typeof data !== 'string'){
				log('turn.err', 'turn.save.not.string');
				return false;
			}

			if(data.length >= MAX_SAVE_LENGTH){
				log('turn.err', 'turn.save.too.long');
				return false;
			}

			bot.metadata.saveData = data;
			return true;
		},

		load: () => {
			return bot.metadata.saveData || '';
		},

		items: () => {
			return JSON.parse(JSON.stringify(bot.metadata.items));
		},

		objects: () => {
			var results = [];
			Object.keys(maze).forEach((k) => {
				if(Object.keys(maze[k].placedObjects).map((v) => {return maze[k].placedObjects[v] !== undefined;}).length > 0){
					var match = k.match(/x(\d)y(\d)/);
					var placedObjects = maze[k].placedObjects;
					results.push({
						x: match[1],
						y: match[2],
						items: JSON.parse(JSON.stringify(Object.keys(placedObjects).map(function(v){
							if(v === 'teleporter'){
								return {
									name: 'teleporter',
									teleporterNumber: placedObjects[v]
								};
							}

							return {
								name: v
							};
						})))
					});
				}
			});
		},

		moveResult: () => {
			return bot.metadata.lastmove;
		}
	});

	return JSON.stringify({
		logObject: logObject,
		maze: mazeData,
		bot: bot.metadata
	});
})(JSON.parse(bot), JSON.parse(maze), startX, startY, saveLength);
