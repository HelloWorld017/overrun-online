var blockly = [{
	name: 'Meiro',
	content: []
}];

var convTemplate = {
	method: {
		next: true
	},
	numberMethod: {
		type: 'Number'
	},
	stringMethod: {
		type: 'String'
	},
	arrayMethod: {
		type: 'Array'
	},
	stringArgMethod: {
		arg: 'String',
		next: true
	}
};

var convData = {
	move: 'method',
	moveResult: 'stringMethod',
	turnLeft: 'method',
	turnRight: 'method',
	x: 'numberMethod',
	y: 'numberMethod',
	direction: 'stringMethod',
	checkWall: 'numberMethod',
	log: 'stringArgMethod',
	objects: 'arrayMethod',
	items: 'arrayMethod',
	carveWall: 'method',
	save: 'stringArgMethod',
	load: 'stringMethod'
};

Object.keys(convData).forEach((v) => {
	var template = convTemplate[convData[v]];
	var object = {
		conv: v,
		message0: global.translator(`plugin.meiro.blockly.${v}.message`),
		tooltip: global.translator(`plugin.meiro.blockly.${v}.tooltip`),
		colour: 260,
	};

	if(template.type !== undefined) object.output = template.type;
	if(template.arg !== undefined){
		if(typeof arg === 'object'){
			object.args0 = [];
			template.arg.forEach((arg) => {
				object.args0.push({
					type: 'input_value',
					name: arg.name,
					check: arg.type
				})
			});
		}else{
			object.args0 = [{
				type: 'input_value',
				name: 'VALUE',
				check: template.arg
			}];
		}
	}
	if(template.next){
		object.nextStatement = null;
		object.previousStatement = null;
	}

	blockly[0].content.push(object);
});

module.exports = blockly;
