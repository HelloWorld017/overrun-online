(function(){
	"use strict";
	var returnValue = [];
	var appendToReturn = (name, cost, things) => {
		things = things || () => {};
		return () => {
			if(currentMovement < cost && overallMovement < cost) throw new Error("Insufficient Movement!");
			currentMovement -= cost;
			overallMovement -= cost;
			things.apply({}, arguments);

			returnValue.append({
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
			'y': y
		};
	};

	var enemy = function(){
		return enemy;
	};

	var defence = undefined;

	if(isDefence){
		defence = appendToReturn('defence', 6);
	}

	"code";

	return JSON.stringify(returnValue);
})();
