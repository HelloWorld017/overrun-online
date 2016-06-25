handlers['OVERRUN'] = (function(){
	var ctx = canvas.getContext('2d');
	_canvas = $(canvas);

	var boardSize = Math.round((_canvas.height() < _canvas.width()) ? _canvas.height() / 2 : _canvas.width() / 2);
	var boardMinX = Math.round((_canvas.width() - boardSize) / 2);
	var boardMaxX = boardMinX + boardSize;
	var boardMinY = Math.round((_canvas.height() - boardSize) / 2);
	var boardMaxY = boardMinY + boardSize;

	canvas.width = _canvas.width();
	canvas.height = _canvas.height();

	ctx.strokeStyle = "#202020";

	async.forEachOf(gameLog, function(roundLog, round, cb){
		var players = roundLog.init.players;
		var turnCount = roundLog.init.turnCount;
		var boardGrid = roundLog.init.boardSize;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.lineWidth = 10;
		ctx.beginPath();
		ctx.moveTo(boardMinX, boardMinY);
		ctx.lineTo(boardMaxX, boardMinY);
		ctx.lineTo(boardMaxX, boardMaxY);
		ctx.lineTo(boardMinX, boardMaxY);
		ctx.lineTo(boardMinX, boardMinY);
		ctx.stroke();
		ctx.closePath();

		var gridWidth = Math.round(boardSize / boardGrid);
		ctx.lineWidth = 3;
		for(var i = 0; i < boardGrid; i++){
			ctx.beginPath();
			ctx.moveTo(boardMinX + i * gridWidth, boardMinY);
			ctx.lineTo(boardMinX + i * gridWidth, boardMaxY);
			ctx.stroke();
			ctx.closePath();

			ctx.beginPath();
			ctx.moveTo(boardMinX, boardMinY + i * gridWidth);
			ctx.lineTo(boardMaxX, boardMinY + i * gridWidth);
			ctx.stroke();
			ctx.closePath();
		}

		async.forEachOf(Array.rangeOf(turnCount), function(v, k, cb2){
			cb2();
		});
		cb();
	});
});