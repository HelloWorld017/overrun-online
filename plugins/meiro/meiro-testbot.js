var defaultObj = {
	moved: {},
	visited: {},
	said: false
};

var saveObj = (load() === '') ? defaultObj : JSON.parse(load());

if(!saveObj.said){
	objects();
	saveObj.said = true;
}

var isRedoable = true;
var directions = {
	N: {
		x: 0,
		y: -1,
		v: 1
	},
	W: {
		x: -1,
		y: 0,
		v: 2
	},
	S: {
		x: 0,
		y: 1,
		v: 3
	},
	E: {
		x: 1,
		y: 0,
		v: 4
	}
};

for(var j = 0; j < 15; j++){
	var check;

	if(saveObj.moved[x() + ',' + y()]){
		check = JSON.parse(JSON.stringify(saveObj.moved[x() + ',' + y()]));
	}else{
		if(!isRedoable){
			break;
		}

		check = checkWall();
		saveObj.moved[x() + ',' + y()] = check;
		isRedoable = false;
	}

	var walls = [];

	if(check >= 8){
		walls.push('S');
		check -= 8;
	}

	if(check >= 4){
		walls.push('E');
		check -= 4;
	}

	if(check >= 2){
		walls.push('W');
		check -= 2;
	}

	if(check >= 1){
		walls.push('N');
	}


	var hasWall = (dir) => {
		return walls.indexOf(dir) !== -1;
	};

	var visitable = [];
	Object.keys(directions).forEach((v) => {
		if(!hasWall(v)){
			visitable.push({
				direction: v,
				x: x() + directions[v].x,
				y: y() + directions[v].y,
				visited: saveObj.visited[(x() + directions[v].x) + ',' + (y() + directions[v].y)]
			});
		}
	});

	visitable.sort((v1, v2) => {
		var visit = (v1.visited || 0) - (v2.visited || 0);
		if(visit === 0){
			return (Math.pow(v1.x - 9, 2) + Math.pow(v1.y - 9, 2)) - (Math.pow(v2.x - 9, 2) + Math.pow(v2.y - 9, 2));
		}
		return visit;
	});

	var moveToken = -(directions[direction()].v - directions[visitable[0].direction].v);
	if(moveToken > 0){
		for(var i = 0; i < moveToken; i++){
			turnLeft();
		}
	}else{
		for(var i = 0; i < -moveToken; i++){
			turnRight();
		}
	}

	move();
	saveObj.visited[x() + "," + y()] = (saveObj.visited[x() + "," + y()] === undefined) ? 1 : saveObj.visited[x() + "," + y()] + 1;
	save(JSON.stringify(saveObj));
}
