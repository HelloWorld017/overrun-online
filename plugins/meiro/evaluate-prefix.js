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
		new Direction(1, 0, 'W', 'S', 'N', 'E'),
		new Direction(-1, 0, 'E', 'N', 'S', 'W'),
		new Direction(0, -1, 'S', 'E', 'W', 'N')
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
			bot.metadata.direction = DIRECTIONS_BY_VALUE[bot.metadata.direction.left];
			log('turn.left');
		},

		turnRight: () => {
			bot.metadata.direction = DIRECTIONS_BY_VALUE[bot.metadata.direction.right];
			log('turn.right');
		},

		move: () => {
			if(bot.metadata.moveerr){
				log('turn.cannot.move');
				return false;
			}

			var currentTile = maze[`x${bot.metadata.x}y${bot.metadata.y}`];

			if(currentTile.placedObjects['wallcutter']) bot.metadata.items.push('wallcutter');

			if(currentTile.placedObjects['trap']){
				restartFromStart();

				log('turn.trap');
				currentTile.placedObject['trap'] = undefined;
				return false;
			}

			var teleporterIndex = undefined;
			if((teleporterIndex = currentTile.placedObjects['teleporter']) !== undefined && bot.metadata.usedTeleporter.indexOf(teleporterIndex) === -1){
				var teleportTarget = mazeData.teleporters[teleporterIndex].filter(function(v){
					return (v.x !== bot.metadata.x) && (v.y !== bot.metadata.y);
				})[0];
				bot.metadata.x = teleportTarget.x;
				bot.metadata.y = teleportTarget.y;
				bot.metadata.usedTeleporter.push(teleporterIndex);
				log('turn.teleport');
				return true;
			}

			if(currentTile.walls[bot.metadata.direction.value] && !bot.metadata.moveerr){
				restartFromStart();
				log('turn.move.over.wall');
				return false;
			}

			bot.metadata.x += bot.metadata.direction.x;
			bot.metadata.y += bot.metadata.direction.y;
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
				maze[`x${bot.metadata.x}y${bot.metadata.y}`].walls[v.value] = false;
				maze[`x${bot.metadata.x + v.x}y${bot.metadata.y + v.y}`].walls[v.opposite] = false;
			});

			return true;
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
		}
	});

	return JSON.stringify({
		logObject: logObject,
		maze: mazeData,
		bot: bot.metadata
	});
})(JSON.parse(bot), JSON.parse(maze), startX, startY, saveLength);
