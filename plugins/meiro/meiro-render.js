var Direction = function(x, y, value, left, right, opposite){
	this.x = x;
	this.y = y;
	this.value = value;
	this.left = left;
	this.right = right;
	this.opposite = opposite;
}

var DIRECTIONS = [
	new Direction(0, -1, 'N', 'W', 'E', 'S'),
	new Direction(-1, 0, 'W', 'S', 'N', 'E'),
	new Direction(1, 0, 'E', 'N', 'S', 'W'),
	new Direction(0, 1, 'S', 'E', 'W', 'N')
];

var DIRECTIONS_BY_VALUE = {
	N: DIRECTIONS[0],
	W: DIRECTIONS[1],
	E: DIRECTIONS[2],
	S: DIRECTIONS[3]
};

var FULL_SIZE = 1;
var HALF_SIZE = 0.4;

var MOVEMENT_DURATION = 250;

var xSize;
var ySize;
var gridSize;

var bots = {};
var renderObject = {};
var renderTarget = {};
var maze;

handlers['MEIRO'] = startRender;

function recalculateSize(){
	xSize = boardSize / gridSize;
	ySize = xSize;
}

function redrawGrid(){
	Object.keys(maze).forEach(function(k){
		var split = k.replace('x', '').split('y');
		var x = parseInt(split[0]);
		var y = parseInt(split[1]);
		var walls = maze[k].walls;

		if(walls.S){
			//SOUTH
			ctx.beginPath();
			ctx.moveTo(boardMinX + xSize * x, boardMinY + ySize * (y + 1));
			ctx.lineTo(boardMinX + xSize * (x + 1), boardMinY + ySize * (y + 1));
			ctx.stroke();
			ctx.closePath();
		}

		if(walls.N){
			//NORTH
			ctx.beginPath();
			ctx.moveTo(boardMinX + xSize * x, boardMinY + ySize * y);
			ctx.lineTo(boardMinX + xSize * (x + 1), boardMinY + ySize * y);
			ctx.stroke();
			ctx.closePath();
		}

		if(walls.W){
			//WEST
			ctx.beginPath();
			ctx.moveTo(boardMinX + xSize * x, boardMinY + ySize * y);
			ctx.lineTo(boardMinX + xSize * x, boardMinY + ySize * (y + 1));
			ctx.stroke();
			ctx.closePath();
		}

		if(walls.E){
			//EAST
			ctx.beginPath();
			ctx.moveTo(boardMinX + xSize * (x + 1), boardMinY + ySize * y);
			ctx.lineTo(boardMinX + xSize * (x + 1), boardMinY + ySize * (y + 1));
			ctx.stroke();
			ctx.closePath();
		}
	});
}

function animate(){
	requestAnimationFrame(animate);
	TWEEN.update();
	render();
}

function updateMovement(cb){
	TWEEN.removeAll();
}

function handleMovement(bot, movementLog, callback){
	switch(movementLog.content){
		case 'turn.left':
			bot.direction = DIRECTIONS_BY_VALUE[bot.direction.left];
			break;
		case 'turn.right':
			bot.direction = DIRECTIONS_BY_VALUE[bot.direction.right];
			break;
		case 'turn.move':
			bot.x += bot.direction.x;
			bot.y += bot.direction.y;
			break;
		case 'turn.teleport':
		case 'turn.trap':
		case 'turn.carve':
		case 'turn.wallcutter':
		case 'turn.text':
			printLog()
		case 'turn.err':
	}

	updateMovement(callback);
}

function startRender(){
	$(document).on('resize', (function(){
		recalculateSize();
		redrawGrid();
	}));

	ctx.strokeStyle = "#202020";

	async.forEachOf(gameLog, function(roundLog, round, cb){
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.lineWidth = 1;
		ctx.strokeStyle = "#202020";

		maze = roundLog.init.data.maze.tiles;
		gridSize = roundLog.init.data.size;

		recalculateSize();
		redrawGrid();

		async.each(roundLog.init.data.players, function(v, cb){
			var img = new Image();
			bots[v.player] = {
				name: v.name,
				player: v.player,
				skin: img,
				direction: DIRECTIONS_BY_VALUE.N,
				x: roundLog.init.data.start.x,
				y: roundLog.init.data.start.y
			};
			img.onload = cb;
			img.src = v.skin;
		}, function(){
			recalculateObject();
			animate();

			async.forEachOfSeries(roundLog, function(turnLog, turn, cb1){
				if(turn === 'final' || turn === 'init') return;
				async.eachSeries(turnLog[0].data, function(playerLog, cb2){
					async.eachSeries(playerLog.log, function(movementLog, callback){
						handleMovement(bots[playerLog.player], movementLog, callback);
					}, function(){
						cb2();
					});
				}, function(){
					cb1();
				});
			}, function(){
				cb();
			});
		});
	});
}

function recalculateObject(){
	TWEEN.removeAll();
	renderTarget = {};

	//Object.values
	var showMultipleBots = Object.keys(bots).map(k => bots[k]).reduce((prev, curr, index, array) => {
		if(typeof prev === 'object'){
			if((prev.x === curr.x) && (prev.y === curr.y)){
				if(index === array.length - 1) return true;

				return prev;
			}else{
				return false;
			}
		}else return prev;
	});

	Object.keys(bots).forEach(function(k, index){
		var v = bots[k];

		var x = Math.round((xSize * v.x) + (xSize / 2));
		var y = Math.round((ySize * v.y) + (ySize / 2));
		var angle = (Math.atan2(v.direction.y, v.direction.x) / Math.PI * 180 + 90);

		renderTarget[v.player] = {
			name: v.name,
			player: v.player,
			skin: v.skin,
			x: x,
			y: y,
			angle: angle,
			size: FULL_SIZE
		};

		renderObject[v.player] = {
			name: v.name,
			player: v.player,
			skin: v.skin,
			x: x,
			y: y,
			angle: angle,
			size: FULL_SIZE
		};

		if(showMultipleBots){
			renderTarget[v.player].size = HALF_SIZE;
			//renderObject[v.player].size = HALF_SIZE;
			renderTarget[v.player].x = Math.round(xSize * v.x + ((index === 0) ? (xSize * 1/3) : (xSize * 2/3)));
			//renderObject[v.player].x = Math.round(xSize * v.x + ((index === 0) ? (xSize * 1/3) : (xSize * 2/3)));
		}
	});
}

function render(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	redrawGrid();
	async.each(renderObject, function(v, cb){
		ctx.drawImage(v.skin, boardMinX + v.x - v.size * xSize / 2, boardMinY + v.y - v.size * ySize / 2, v.size * xSize, v.size * ySize);
		cb();
	});
}
