(function(overallMovement, currentMovement, turn, yaw, x, y, isDefence){
	"use strict";
	var returnValue = [];
	var appendToReturn = (name, cost, things) => {
		things = things || () => {};
		return () => {
			if(currentMovement < cost && overallMovement < cost) throw new Error("Insufficient Movement!");
			currentMovement -= cost;
			overallMovement -= cost;
			things.apply({}, arguments);

			returnValue.push({
				name: name,
				arguments: arguments
			});
		};
	};

	var log = appendToReturn('log', 0);
	var move = appendToReturn('move', 1, () => {
		x += Math.sin(yaw);
		y += Math.cos(yaw);
	});

	var rotate = appendToReturn('rotate', 1, (rot) => {
		yaw += rot;
	});

	var status = () => {
		return {
			'left-overall': overallMovement,
			'left-current': currentMovement,
			'turn': turn,
			'yaw': yaw,
			'x': x,
			'y': y,
			'isDefence': isDefence
		};
	};

	var getEnemy = () => {
		return enemy;
	};

	var defence = undefined;

	if(isDefence){
		defence = appendToReturn('defence', 6);
	}

	//Blockly code
	var getOverall = (e) => {
		return e ? enemy.overallMovement : overallMovement;
	};

	var getCurrent = (e) => {
		return e ? enemy.currentMovement : currentMovement;
	};

	var getTurn = () => {
		return turn;
	};

	var getYaw = (e) => {
		return e ? enemy.yaw : yaw;
	};

	var getX = (e) => {
		return e ? enemy.x : x;
	};

	var getY = (e) => {
		return e ? enemy.y : y;
	};

	var getIsDefence = () => {
		return isDefence;
	};

	var getEnemyName = () => {
		return enemy.name;
	};

	"code";

	return JSON.stringify(returnValue);
})(overallMovement, currentMovement, turn, yaw, x, y, isDefence, enemy);
