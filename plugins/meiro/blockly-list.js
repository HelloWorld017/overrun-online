var blockly = [{
	name: 'Meiro',
	content: [
		{
			conv: 'checkWall',
			message0: global.translator(`plugin.meiro.blockly.checkWall.message`),
			color: 160,
			tooltip: global.translator(`plugin.meiro.blockly.checkWall.tooltip`),
			output: 'Number'
		},
		{
			conv: 'load',
			message0: global.translator(`plugin.meiro.blockly.load.message`),
			color: 160,
			tooltip: global.translator(`plugin.meiro.blockly.load.tooltip`),
			output: 'String'
		},

		{
			conv: 'items',
			message0: global.translator(`plugin.meiro.blockly.items.message`),
			color: 160,
			tooltip: global.translator(`plugin.meiro.blockly.items.tooltip`),
			output: 'Array'
		}
	]
}];

blockly[0].content = blockly[0].content.concat(['move', 'turnLeft', 'turnRight', 'carveWall'].map((v) => {
	return {
		conv: v,
		message0: global.translator(`plugin.meiro.blockly.${v}.message`),
		color: 160,
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
		color: 160,
		tooltip: global.translator(`plugin.meiro.blockly.${v}.tooltip`),
		previousStatement: null,
		nextStatement: null
	};
}));

module.exports = blockly;
