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

var colors = {
	teleport: "#00C0FF",
	move: "#00A0FF",
	rotate: "rgba(0, 230, 255, %a)",
	trap: "#805000",
	maze: "#202020",
	dialog: "#00A0FF",
	teleporter: {
		0: [255, 50, 50],
		1: [50, 255, 50],
		2: [50, 50, 255]
	}
};

var FULL_SIZE = 1;
var HALF_SIZE = 0.4;

var MOVEMENT_DURATION = 500;

var xSize;
var ySize;
var gridSize;

var stopRequested = false;
var ingame = false;
var currTurn = 0;
var animateRequested = false;
var gcRequested = false;
var bots = {};
var renderObject = {};
var renderTarget = {};
var particles = [];
var maze;
var teleporters;
var images = {};
Math.sign = Math.sign || function(x) {
	x = +x; // convert to a number
	if (x === 0 || isNaN(x)) {
		return x;
	}
	return x > 0 ? 1 : -1;
}
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

		var objects = Object.keys(maze[k].placedObjects).filter(function(v){
			return maze[k].placedObjects[v] !== undefined;
		});

		if(objects.length > 0){
			switch(objects[0]){
				case 'teleporter':
					ctx.drawImage(images['teleporter' + maze[k].placedObjects['teleporter']], boardMinX + xSize * x, boardMinY + ySize * y, xSize, ySize);
					break;

				case 'trap':
				case 'wallcutter':
					ctx.drawImage(images[objects[0]], boardMinX + xSize * x, boardMinY + ySize * y, xSize, ySize);
					break;
			}
		}
	});
}

function animate(){
	requestAnimationFrame(animate);
	TWEEN.update();
	Particle.update();
}

function updateMovement(bot, cb){
	TWEEN.removeAll();
	new TWEEN.Tween(renderObject[bot.player])
	.to(renderTarget[bot.player], MOVEMENT_DURATION)
	.onUpdate(function(){
		render();
	})
	.start();
	setTimeout(cb, MOVEMENT_DURATION);
}

function handleMovement(bot, movementLog, callback, playerLog){
	var updateNeeded = true;
	var clearAnimation = false;
	switch(movementLog.content){
		case 'turn.left':
			bot.direction = DIRECTIONS_BY_VALUE[bot.direction.left];
			renderObject[bot.player].animate = 'rotate';
			clearAnimation = true;
			break;

		case 'turn.right':
			bot.direction = DIRECTIONS_BY_VALUE[bot.direction.right];
			renderObject[bot.player].animate = 'rotate';
			clearAnimation = true;
			break;

		case 'turn.move':
			bot.x += bot.direction.x;
			bot.y += bot.direction.y;
			renderObject[bot.player].animate = 'move';
			clearAnimation = true;
			break;

		case 'turn.teleport':
			var teleportTarget = teleporters[parseInt(movementLog.data.replace('teleport', ''))].filter(function(v){
				return (v.x !== bot.x) || (v.y !== bot.y);
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
			var v = bot.direction;
			var targetTile = maze['x' + (bot.x + v.x) + 'y' + (bot.y + v.y)];
			if(targetTile !== undefined){
				maze['x' + bot.x + 'y' + bot.y].walls[v.value] = false;
				targetTile.walls[v.opposite] = false;
			}

			var x = boardMinX + bot.x * xSize + xSize / 2 + v.x * xSize / 2;
			var y = boardMinY + bot.y * ySize + ySize / 2 + v.y * ySize / 2;
			for(var i = 0; i < 10; i++) particles.push(new Particle(x, y, Math.round(xSize / 7), undefined, 200, colors['wall'], xSize / 400, undefined, Math.random(), Math.random()));
			break;

		case 'turn.wallcutter':
			maze[movementLog.data].placedObjects.wallcutter = undefined;
			break;

		case 'turn.text':
			printLog(bot.player + " : " + movementLog.data);
			updateNeeded = false;
			break;

		case 'turn.err':
			switch(movementLog.data){
				case 'turn.move.over.wall':
					bot.x = 0;
					bot.y = 0;
					break;
			}

			printLog(bot.player + ' : ' + meiroTranslations[movementLog.data]);
			break;

		case 'turn.err.runtime':
			try{
				printLog(bot.player + ' : \n' + JSON.parse(playerLog.err));
			}catch(e){}

	}
	if(clearAnimation){
		setTimeout(function(){
			renderObject[bot.player].animate = undefined;
		}, MOVEMENT_DURATION);
	}

	if(updateNeeded){
		recalculateObject(true);
		updateMovement(bot, callback);
	}else callback();
}

function startRender(){
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ingame = true;
	if(!gcRequested){
		Particle.garbageCollect();
		$(window).on('resize', (function(){
			recalculateSize();
			render();
		}));
		gcRequested = true;
	}

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
		async.each(['trap', 'teleporter', 'wallcutter'], function(v, cb){
			var img = new Image();
			var _cb = cb;
			if(v === 'teleporter'){
				_cb = function(){
					var nCanvas = document.createElement('canvas');
					var nCtx = nCanvas.getContext('2d');
					nCanvas.width = 64;
					nCanvas.height = 64;
					async.each(Array.rangeOf(Object.keys(teleporters).length), function(v, cb){
						nCtx.drawImage(img, 0, 0, 64, 64);
						try{
							var imgData = nCtx.getImageData(0, 0, img.width || 64, img.height || 64);
							for(var y = 0; y < imgData.height; y++){
								for(var x = 0; x < imgData.width; x++){
									var i = (x * 4) + (y * 4 * img.width);
									if(imgData.data[i + 3] !== 0){
										imgData.data[i] = colors.teleporter[v][0];
										imgData.data[i + 1] = colors.teleporter[v][1];
										imgData.data[i + 2] = colors.teleporter[v][2];
									}
								}
							}
							nCtx.putImageData(imgData, 0, 0, 0, 0, imgData.width, imgData.height);
							images['teleporter' + v] = new Image();
							images['teleporter' + v].onload = cb;
							images['teleporter' + v].src = nCanvas.toDataURL();
						}catch(e){
							images['teleporter' + v] = img;
							cb();
						}
					}, function(){
						cb();
					});
				};
			}
			img.onload = _cb;
			img.src = '/meiro/' + v + '.svg';
			images[v] = img;
		}, function(){
			var ie = false;
			async.each(roundLog.init.data.players, function(v, cb){
				var img = new Image();
				var img2 = new Image();

				bots[v.player] = {
					player: v.player,
					skin: img,
					playerSkin : img2,
					direction: DIRECTIONS_BY_VALUE.N,
					x: roundLog.init.data.start.x,
					y: roundLog.init.data.start.y
				};

				img.setAttribute('crossOrigin', 'anonymous');
				img.onload = function(){
					var nCanvas = document.createElement('canvas');
					var nCtx = nCanvas.getContext('2d');
					nCanvas.width = 64;
					nCanvas.height = 64;

					nCtx.drawImage(img, 0, 0, 64, 64);
					img2.setAttribute('crossOrigin', 'anonymous');
					img2.onload = function(){
						nCtx.drawImage(img2, 32, 32, 32, 32);
						try{
							img.onload = cb;
							img.src = nCanvas.toDataURL();
						}catch(e){
							ie = true;
							cb();
						}
					};

					img2.src = "https://www.gravatar.com/avatar/" + v.md5 + "?s=200";
				};
				img.src = v.skin;
			}, function(){
				if(ie) alert(meiroTranslations['update.browser']);
				recalculateObject();
				Object.keys(bots).forEach(function(k){
					copyTargetToObject(k);
				});
				if(!animateRequested){
					animate();
					animateRequested = true;
				}

				async.forEachOfSeries(roundLog, function(turnLog, turn, cb1){
					if(turn === 'final' || turn === 'init'){
						cb1();
						return;
					}
					currTurn = turn;
					async.eachSeries(turnLog[0].data, function(playerLog, cb2){
						async.eachSeries(playerLog.log, function(movementLog, callback){
							if(stopRequested){
								callback(true);
								return;
							}
							handleMovement(bots[playerLog.player], movementLog, callback);
						}, function(){
							if(stopRequested){
								cb2(true);
								return;
							}
							cb2();
						});
					}, function(){
						if(stopRequested){
							cb1(true);
							return;
						}
						cb1();
					});
				}, function(){
					if(stopRequested){
						cb(true);
						return;
					}
					cb();
				});
			});
		});
	}, function(){
		ingame = false;
		if(stopRequested){
			var _stopRequested = stopRequested;
			stopRequested = undefined;
			_stopRequested();
			return;
		}
		procEnd();
	});
}

function recalculateObject(removeAnimation){
	TWEEN.removeAll();
	renderTarget = {};

	//Object.values
	var showMultipleBots = Object.keys(bots).map(function(k){return bots[k]}).reduce(function(prev, curr, index, array){
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

function render(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	redrawGrid();
	Particle.renderParticle(ctx);
	async.each(renderObject, function(v, cb){
		var x = boardMinX + v.x;
		var y = boardMinY + v.y;
		if(v.animate){
			procAnimate(v);
		}
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(Math.toRad(v.angle));
		ctx.drawImage(v.skin, - v.size * xSize / 2,  - v.size * ySize / 2, v.size * xSize, v.size * ySize);
		ctx.restore();
		cb();
	});
	ctx.font = (xSize - 5) + 'px "Exo 2"';
	ctx.fillText(currTurn, _canvas.width() - xSize, _canvas.height() - ySize);
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
			particles.push(new Particle(x, y, Math.round(xSize / 3), undefined, 200, colors['trap'], xSize / 400, undefined));
			break;

		case 'move':
			var radAngle = Math.toRad(v.angle);
			var cos = Math.cos(radAngle);
			var sin = Math.sin(radAngle);
			var x = boardMinX + v.x;
			var y = boardMinY + v.y;
			var offsetX = xSize * cos / 2 - xSize / 2 * -Math.sign(v.angle - 135);
			var offsetY = ySize * sin / 2 - ySize / 2 * -Math.sign(v.angle - 135) * ((Math.inRange(-45, 45, v.angle) || Math.inRange(135, 225, v.angle)) ? -1 : 1);
			var xs = xSize * v.size;
			var ys = ySize * v.size;
			var motionX = xSize / 2 * cos;
			var motionY = ySize / 2 * sin;


			particles.push(new Particle.custom(x, y, xSize - Math.random() * xSize / 3, 2, 100, colors['move'], function(_this){
				_this.motionX = Math.random() * cos / 2;
				_this.motionY = Math.random() * sin / 2;
			}, function(_this){
				_this.sizeY = Math.max(0, _this.sizeY - 0.2);
			}, function(ctx, _this){
				ctx.fillStyle = _this.color;

				ctx.beginPath();
				//v.size may differ
				var xs = v.size * xSize;
				var ys = v.size * ySize;
				ctx.ellipse(
					_this.x + v.size * offsetX + _this.motionX * xs - cos * xs / 4,
					_this.y + v.size * offsetY + _this.motionY * ys - sin * ys / 4,
					_this.sizeX * v.size,
					_this.sizeY * v.size,
					Math.PI / 2 + radAngle,
					0,
					Math.PI * 2);
				ctx.fill();
			}));
			break;

		case 'rotate':
			var x = boardMinX + v.x;
			var y = boardMinY + v.y;

			particles.push(new Particle.custom(x, y, Math.random() * xSize, Math.random() * ySize, 100, colors['rotate'], function(_this){
				_this.angle = Math.toRad(Math.random() * 360);
				_this.opacity = 1;
			}, function(_this){
				_this.angle += Math.toRad(Math.random() * 30);
				_this.opacity = Math.max(0, _this.opacity - 0.03);
			}, function(ctx, _this){
				ctx.strokeStyle = _this.color.replace('%a', _this.opacity);

				ctx.beginPath();
				//v.size may differ
				var xs = v.size * _this.sizeX;
				var ys = v.size * _this.sizeY;
				ctx.ellipse(_this.x, _this.y, xs, ys, _this.angle, 0, Math.PI * 2);
				ctx.stroke();
			}));
			break;
	}
}

function procEnd(){
	var sizeY = boardSize;
	var startY = (canvas.height - boardSize) / 2;
	var scores = Object.keys(wholeLog.score);
	scores.sort(function(v1, v2){
		return wholeLog.score[v2] - wholeLog.score[v1];
	});

	var draw = (wholeLog.score[scores[0]] === wholeLog.score[scores[1]]);

	async.eachSeries(Array.rangeOf(100), function(v, cb){
		ctx.fillStyle = colors['dialog'];
		ctx.fillRect(0, startY, canvas.width * v / 100, boardSize);
		if(draw){
			ctx.drawImage(bots[scores[0]].playerSkin, canvas.width / 2 - 3 * xSize, canvas.height / 2 - 2 * ySize, 2 * xSize, 2 * ySize);
			ctx.drawImage(bots[scores[1]].playerSkin, canvas.width / 2 + xSize, canvas.height / 2 - 2 * ySize, 2 * xSize, 2 * ySize);
		}else ctx.drawImage(bots[scores[0]].playerSkin, canvas.width / 2 - 2 * xSize, canvas.height / 2 - 3 * ySize, 4 * xSize, 4 * ySize);

		ctx.font = '45px "Exo 2"';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = "#fff";
		ctx.fillText(draw ? 'Draw' : 'Win', canvas.width / 2, canvas.height / 2 + 2 * ySize);
		setTimeout(cb, 5);
	});
}
