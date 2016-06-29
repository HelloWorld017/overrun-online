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

var Particle = function(x, y, sizeX, sizeY, life, color, reduceX, reduceY, motionX, motionY){
	this.x = x;
	this.y = y;
	this.motionX = motionX || 0;
	this.motionY = motionY || 0;
	this.sizeX = (sizeX === undefined) ? 50 : sizeX;
	this.sizeY = (sizeY  === undefined) ? this.sizeX : sizeY;
	this.reduceX  = reduceX || 0;
	this.reduceY = (reduceY === undefined) ? this.reduceX : reduceY;
	this.life = (life === undefined) ? 100 : life;
	this.current = 0;
	this.color = color || "#000";
};

Particle.prototype.update = function(){
	if(this.current <= this.life){
		this.current++;
		this.sizeX = Math.max(0, this.sizeX - this.reduceX);
		this.sizeY = Math.max(0, this.sizeY - this.reduceY);
		this.x += this.motionX;
		this.y += this.motionY;
	}
};

var particles = [];

var colors = {
	teleport: "#00C0FF",
	trap: "#805000",
	maze: "#202020"
};

var FULL_SIZE = 1;
var HALF_SIZE = 0.4;

var MOVEMENT_DURATION = 500;

var xSize;
var ySize;
var gridSize;

var bots = {};
var renderObject = {};
var renderTarget = {};
var particles = [];
var maze;
var teleporters;

handlers['MEIRO'] = startRender;

function recalculateSize(){
	xSize = boardSize / gridSize;
	ySize = xSize;
}

function redrawGrid(){
	ctx.strokeStyle = colors['maze'];
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
	particles.forEach(function(v){
		v.update();
	});
}

function updateMovement(bot, cb){
	TWEEN.removeAll();
	new TWEEN.Tween(renderObject[bot.player])
	.to(renderTarget[bot.player], MOVEMENT_DURATION)
	.onUpdate(function(){
		render(bot);
	})
	.start();
	setTimeout(cb, MOVEMENT_DURATION);
}

function handleMovement(bot, movementLog, callback){
	var updateNeeded = true;
	renderObject[bot.player].animate = "teleport";
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
			var teleportTarget = teleporters[parseInt(movementLog.data.replace('teleport', ''))].filter(function(v){
				return (v.x !== bot.x) && (v.y !== bot.y);
			})[0];
			bot.x = teleportTarget.x;
			bot.y = teleportTarget.y;
			renderObject[bot.player].animate = 'teleport';
			break;

		case 'turn.trap':
			bot.x = 0;
			bot.y = 0;
			renderObject[bot.player].animate = 'trap';
			break;

		case 'turn.carve':
		case 'turn.wallcutter':
		case 'turn.text':
			printLog(movementLog.data);
			updateNeeded = false;
			break;

		case 'turn.err':
			switch(movementLog.data){
				case 'turn.move.over.wall':
				bot.x = 0;
				bot.y = 0;
			}
			printLog(bot.player + ' : ' + movementLog.data);
			break;
	}
	if(updateNeeded){
		recalculateObject(true);
		updateMovement(bot, callback);
	}else callback();
}

function startRender(){
	garbageCollect();
	$(document).on('resize', (function(){
		recalculateSize();
		redrawGrid();
	}));

	ctx.ellipse = ctx.ellipse || function(cx, cy, rx, ry, rot, aStart, aEnd){
		this.save();
		this.translate(cx, cy);
		this.rotate(rot);
		this.translate(-rx, -ry);

		this.scale(rx, ry);
		this.arc(1, 1, 1, aStart, aEnd, false);
		this.restore();
	};

	async.forEachOf(gameLog, function(roundLog, round, cb){
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.lineWidth = 1;

		maze = roundLog.init.data.maze.tiles;
		teleporters = roundLog.init.data.maze.teleporters;
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
			Object.keys(bots).forEach(function(k){
				copyTargetToObject(k);
			});
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

function recalculateObject(removeAnimation){
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

		if(showMultipleBots){
			renderTarget[v.player].size = HALF_SIZE;
			renderTarget[v.player].x = Math.round(xSize * v.x + ((index === 0) ? (xSize * 1/3) : (xSize * 2/3)));
		}
	});
}

function copyTargetToObject(player){
	var target = renderTarget[player];
	//renderObject[player] = JSON.parse(JSON.stringify(target)); skin is HTML Element!
	renderObject[player] = {
		name: target.name,
		player: target.player,
		skin: target.skin,
		x: target.x,
		y: target.y,
		angle: target.angle,
		size: target.size
	};
}

function garbageCollect(){
	particles = particles.filter(function(v){
		return v.life > v.current;
	});
	setTimeout(garbageCollect, 5000);
}

function render(bot){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	redrawGrid();
	renderParticle();
	async.each(renderObject, function(v, cb){
		var x = boardMinX + v.x;
		var y = boardMinY + v.y;
		if(v.animate){
			procAnimate(v);
		}
		ctx.drawImage(v.skin, x - v.size * xSize / 2, y - v.size * ySize / 2, v.size * xSize, v.size * ySize);
		cb();
	});
}

function renderParticle(){
	particles.forEach(function(v){
		ctx.fillStyle = v.color;

		ctx.beginPath();
		ctx.ellipse(v.x, v.y, v.sizeX, v.sizeY, 0, 0, Math.PI * 2);
		ctx.fill();
	});
}

function procAnimate(v){
	switch(v.animate){
		case 'teleport':
			var x = boardMinX + v.x + Math.random() * xSize / 4 - xSize / 8;
			var y = boardMinY + v.y + Math.random() * ySize / 4 - xSize / 8;
			particles.push(new Particle(x, y, Math.round(xSize / 8), undefined, 100, colors['teleport'], xSize / 400, undefined));
			break;

		case 'trap':
			var x = boardMinX + v.x;
			var y = boardMinY + v.y;
			particles.push(new Particle(x, y, Math.round(xSize / 3), undefined, 100, colors['trap'], xSize / 400, undefined));
			break;
	}
}
