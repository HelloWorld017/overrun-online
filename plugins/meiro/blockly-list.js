var blockly = [{
	name: 'Meiro',
	content: [
		{
			conv: 'items',
			message0: global.translator(`plugin.meiro.blockly.items.message`),
			colour: 260,
			tooltip: global.translator(`plugin.meiro.blockly.items.tooltip`),
			output: 'Array'
		}
	]
}];

blockly[0].content = blockly[0].content.concat(['move', 'turnLeft', 'turnRight', 'carveWall'].map((v) => {
	return {
		conv: v,
		message0: global.translator(`plugin.meiro.blockly.${v}.message`),
		colour: 260,
		tooltip: global.translator(`plugin.meiro.blockly.${v}.tooltip`),
		previousStatement: null,
		nextStatement: null
	};
}));


blockly[0].content = blockly[0].content.concat(['log', 'save'].map((v) => {
	return {
		conv: v,
		message0: global.translator(`plugin.meiro.blockly.${v}.message`),
		args0: [
			{
				type: 'input_value',
				name: 'VALUE',
				check: 'String'
			}
		],
		colour: 260,
		tooltip: global.translator(`plugin.meiro.blockly.${v}.tooltip`),
		previousStatement: null,
		nextStatement: null
	};
}));

blockly[0].content = blockly[0].content.concat(['checkWall', 'x', 'y'].map((v) => {
	return {
		conv: v,
		message0: global.translator(`plugin.meiro.blockly.${v}.message`),
		colour: 260,
		tooltip: global.translator(`plugin.meiro.blockly.${v}.tooltip`),
		output: 'Number'
	};
}));

blockly[0].content = blockly[0].content.concat(['direction', 'load'].map((v) => {
	return {
		conv: 'load',
		message0: global.translator(`plugin.meiro.blockly.${v}.message`),
		colour: 260,
		tooltip: global.translator(`plugin.meiro.blockly.${v}.tooltip`),
		output: 'String'
	};
}));


module.exports = blockly;
