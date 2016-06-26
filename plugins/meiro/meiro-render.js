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

var bots = {};
var renderObject = {};
var renderTarget = {};
var maze;

handlers['MEIRO'] = startRender;

updateHandlers.push(function(){
	recalculateSize();
	redrawGrid();
});

function recalculateSize(){
	xSize = boardSize / roundLog.init.data.size;
	ySize = xSize;

	recalculateObject();
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
		case 'turn.teleport':
		case 'turn.trap':
		case 'turn.carve':
		case 'turn.wallcutter':
		case 'turn.text':
		case 'turn.err':
	}

	updateMovement(callback);
}

function startRender(){
	ctx.strokeStyle = "#202020";

	async.forEachOf(gameLog, function(roundLog, round, cb){
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.lineWidth = 1;
		ctx.strokeStyle = "#202020";

		maze = roundLog.init.data.maze.tiles;

		recalculateSize();
		redrawGrid();

		roundLog.init.data.players.forEach(function(v){
			bots[v.player] = {
				name: v.name,
				player: v.player,
				skin: v.skin,
				direction: DIRECTIONS_BY_VALUE.N,
				x: roundLog.init.data.start.x,
				y: roundLog.init.data.start.y
			};
		});

		recalculateObject();

		//Clone renderTarget
		renderObject = JSON.parse(JSON.stringify(renderTarget));

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
		renderTarget[v.player] = {
			name: v.name,
			player: v.player,
			skin: v.skin,
			x: (xSize * v.x) + (v.x / 2),
			y: (ySize * v.y) + (v.y / 2),
			angle: (Math.atan2(v.direction.y, v.direction.x) / Math.PI * 180 + 90),
			size: FULL_SIZE
		};

		if(showMultipleBots){
			renderTarget[v.player].size = HALF_SIZE;
			renderTarget[v.player].x = xSize * v.x + ((index === 0) ? (v.x * 1/3) : (v.x * 2/3));
		}
	});
}

function render(){
	
}
