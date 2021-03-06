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
	try{
		vm.runInNewContext(code, {
			log: (content) => {
				if(typeof content !== 'string'){
					log('turn.err', 'turn.content.not.string', true);
					return false;
				}

				if(content.length >= 256){
					log('turn.err', 'turn.log.too.long', true);
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
				var nextPosition = `x${bot.metadata.x + bot.metadata.direction.x}y${bot.metadata.y + bot.metadata.direction.y}`
				var currentTile = maze[currentPosition];
				var nextTile = maze[nextPosition];

				bot.metadata.x += bot.metadata.direction.x;
				bot.metadata.y += bot.metadata.direction.y;
				log('turn.move');

				if(currentTile.walls[bot.metadata.direction.value]){
					restartFromStart();
					log('turn.err', 'turn.move.over.wall', true);
					bot.metadata.lastmove = 'wall';
					return false;
				}

				if(nextTile.placedObjects['wallcutter']){
					bot.metadata.items.push('wallcutter');
					nextTile.placedObjects['wallcutter'] = undefined;
					log('turn.wallcutter', nextPosition);
				}

				if(nextTile.placedObjects['trap']){
					restartFromStart();

					log('turn.trap', nextPosition);
					nextTile.placedObjects['trap'] = undefined;
					bot.metadata.lastmove = 'trap';
					return true;
				}

				var teleporterIndex = undefined;
				if((teleporterIndex = nextTile.placedObjects['teleporter']) !== undefined && bot.metadata.usedTeleporter.indexOf(teleporterIndex) === -1){
					var teleportTarget = mazeData.teleporters[teleporterIndex].filter((v) => {
						return `x${v.x}y${v.y}` !== nextPosition;
					})[0];
					bot.metadata.x = teleportTarget.x;
					bot.metadata.y = teleportTarget.y;
					bot.metadata.usedTeleporter.push(teleporterIndex);
					log('turn.teleport', 'teleport' + teleporterIndex);
					bot.metadata.lastmove = 'teleport';
					return true;
				}

				bot.metadata.lastmove = 'normal';
				return true;
			},

			carveWall: () => {
				if(bot.metadata.items.indexOf('wallcutter') === -1){
					log('turn.err', 'turn.carve.fail', true);
					return false;
				}

				//Array.remove(bot.metadata.items, bot.metadata.items.indexOf('wallcutter'));
				var removed = false;
				bot.metadata.items = bot.metadata.items.filter((v) => {
					if(removed) return true;
					if(v === 'wallcutter'){
						removed = true;
						return false;
					}
				});

				var v = bot.metadata.direction;

				var targetTile = maze[`x${bot.metadata.x + v.x}y${bot.metadata.y + v.y}`];
				if(targetTile !== undefined){
					//Prevents carving the outermost wall
					maze[`x${bot.metadata.x}y${bot.metadata.y}`].walls[v.value] = false;
					targetTile.walls[v.opposite] = false;
					log('turn.carve');
					return true;
				}
				return false;
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
					var placedObjects = Object.keys(maze[k].placedObjects).filter((v) => {return maze[k].placedObjects[v] !== undefined;});
					if(placedObjects.length > 0){
						var match = k.match(/x(\d)y(\d)/);
						var placedObject = placedObjects[0];

						var result = {
							x: parseInt(match[1]),
							y: parseInt(match[2]),
							name: placedObject
						};

						if(placedObject === 'teleporter'){
							results.teleporterNumber = maze[k].placedObjects[placedObject];
						}

						results.push(result);
					}
				});
				return results;
			},

			moveResult: () => {
				return bot.metadata.lastmove;
			}
		});
	}catch(e){}

	return JSON.stringify({
		logObject: logObject,
		maze: mazeData,
		bot: bot.metadata
	});
})(JSON.parse(bot), JSON.parse(maze), startX, startY, saveLength);
