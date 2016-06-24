(function(botData, mazeData){
	var bot = {
		metadata: botData
	};

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

	var vm = require('vm');
	vm.runInNewContext(code,{
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
			if(bot.metadata.moveerr){
				log('turn.cannot.move');
				return false;
			}

			var currentTile = maze[`x${bot.metadata.x}y${bot.metadata.y}`];

			if(currentTile.placedObjects['wallcutter']) bot.metadata.items.push('wallcutter');

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

			return maze[`x${bot.metadata.x}y${bot.metadata.y}`].walls;
		}
	});

	return {
		logObject: logObject,
		maze: maze,
		bot: bot.metadata
	};
})(JSON.parse(bot), JSON.parse(maze));
