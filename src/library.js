Math.toRad = function(angle){
	return angle * Math.PI / 180;
};

Math.toDeg = function(angle){
	return angle * 180 / Math.PI;
};

Math.clamp = function(min, max, value){
	return Math.max(Math.min(value, max), min);
};

Math.inRange = function(min, max, value){
	if(min > max){
		return (max < value) && (value < min);
	}

	return (min < value) && (value < max);
};

Math.randomRange = function(max, min){
	min = min || 0;

	return Math.round(Math.random() * (max - min)) + min;
};

Number.prototype.zfill = function(repeat){
	var num = this.toString();
	if(num.length >= repeat) return num;

	var zeros = '';
	for(var i = 0; i < repeat - num.length; i++){
		zeros = zeros + '0';
	}

	return zeros + num;
};

Date.prototype.format = function(format){
	var that = this;

	return format.replace(/(yyyy|yy|MM|dd|hh|HH|mm|ss|a)/g, function(type){
		switch(type){
			case 'yyyy': return that.getFullYear();
			case 'yy': return (that.getFullYear() % 100).zfill(2);
			case 'MM': return (that.getMonth() + 1).zfill(2);
			case 'dd': return (that.getDate()).zfill(2);
			case 'hh': return (that.getHours() % 12).zfill(2);
			case 'HH': return (that.getHours()).zfill(2);
			case 'mm': return (that.getMinutes()).zfill(2);
			case 'ss': return (that.getSeconds()).zfill(2);
			case 'a': return (that.getHours() >= 12 ? 'PM':'AM');
			return type;
		}
	});
};

function Position(x, y){
	this.xPos = x;
	this.yPos = y;
}

Position.prototype = {
	x: function(x){
		if(x === undefined) return this.xPos;

		this.xPos = x;
		return this;
	},

	y: function(y){
		if(y === undefined) return this.yPos;

		this.yPos = y;
		return this;
	},

	deepEqual: function(pos){
		return (pos.x() === this.x() && pos.y() === this.y());
	}
};

//Axis Aligned Bounding Box
function AABB(min, max){
	if(min.x() > max.x() && min.y() > max.y()){
		this.minPos = max;
		this.maxPos = min;
		return;
	}

	if(min.x() > max.x()){
		this.minPos = new Position(max.x(), min.y());
		this.maxPos = new Position(min.x(), max.y());
		return;
	}

	if(min.y() > max.y()){
		this.minPos = new Position(min.x(), max.y());
		this.maxPos = new Position(max.x(), min.y());
		return;
	}

	this.minPos = min;
	this.maxPos = max;
}

AABB.prototype = {
	min: function(min){
		if(min === undefined) return this.minPos;

		this.minPos = min;
		return this;
	},

	max: function(max){
		if(max === undefined) return this.maxPos;

		this.maxPos = max;
		return this;
	},

	minX: function(minX){
	if(minX === undefined) return this.minPos.x();

		this.minPos.x(minX);
		return this;
	},

	minY: function(minY){
		if(minY === undefined) return this.minPos.y();

		this.minPos.y(minY);
		return this;
	},

	maxX: function(maxX){
		if(maxX === undefined) return this.maxPos.x();

		this.maxPos.x(maxX);
		return this;
	},

	maxY: function(maxY){
		if(maxY === undefined) return this.maxPos.y();

		this.maxPos.y(maxY);
		return this;
	},

	nudgeX: function(amount){
		this.minX(this.minX() + amount);
		this.maxX(this.maxX() + amount);
		return this;
	},

	nudgeY: function(amount){
		this.minY(this.minY() + amount);
		this.maxY(this.maxY() + amount);
		return this;
	},

	inPosition: function(pos){
		return Math.inRange(this.minX(), this.maxX(), pos.x()) && Math.inRange(this.minY(), this.maxY(), pos.y());
	},

	deepEqual: function(aabb){
		return (this.min().deepEqual(aabb.min()) && this.max().deepEqual(aabb.max()));
	}
};

//Appending built-in object's prototype is dangerous.
Array.rangeOf = function(max){
	return Array.apply(null, Array(max)).map(function(v, k){
		return k;
	});
};

Array.random = function(array){
	return array[Math.randomRange(array.length - 1, 0)];
}

Array.remove = function(array, index){
	array.splice(index, 1);
};

Array.shuffle = function(array){
	var newArray = [];
	var usedKey = Array.rangeOf(array.length);

	Array.rangeOf(array.length).forEach(function(v){
		var k = Math.randomRange(usedKey.length - 1 , 0);
		newArray.push(array[usedKey[k]]);
		Array.remove(usedKey, k);
	});

	return newArray;
};

Array.clone = function(array){
	return array.slice(0);
};

module.exports = {
	Position: Position,
	AABB: AABB
};
