var blockly = [{
	name: 'Overrun',
	content: [
		{
			conv: 'log',
			message0: global.translator('plugin.overrun.blockly.log.message'),
			args0: [
				{
					'type': 'input_value',
					'name': 'VALUE',
					'check': 'String'
				}
			],
			color: 160,
			tooltip: global.translator('plugin.overrun.blockly.log.tooltip'),
			previousStatement: null,
			nextStatement: null
		},
		{
			conv: 'move',
			message0: global.translator('plugin.overrun.blockly.move.message'),
			color: 160,
			tooltip: global.translator('plugin.overrun.blockly.move.tooltip'),
			previousStatement: null,
			nextStatement: null
		},
		{
			conv: 'defence',
			message0: global.translator('plugin.overrun.blockly.defence.message'),
			color: 160,
			tooltip: global.translator('plugin.overrun.blockly.defence.tooltip'),
			previousStatement: null,
			nextStatement: null
		},
		{
			conv: 'rotate',
			message0: global.translator('plugin.overrun.blockly.rotate.tooltip'),
			args0: [
				{
					'type': 'input_value',
					'name': 'VALUE',
					'check': 'Number'
				}
			],
			tooltip: global.translator('plugin.overrun.blockly.rotate.tooltip'),
			previousStatement: null,
			nextStatement: null
		},
		{
			conv: 'getIsDefence',
			message0: global.translator(`plugin.overrun.blockly.getIsDefence.message`),
			args0: [
				{
					'type': 'field_dropdown',
					'name': 'VALUE',
					'options': [['enemy', 'ENEMY'], ['me', 'ME']]
				}
			],
			color: 160,
			tooltip: global.translator(`plugin.overrun.blockly.getIsDefence.tooltip`),
			previousStatement: null,
			nextStatement: null,
			output: 'Boolean'
		},
		{
			conv: 'getEnemyName',
			message0: global.translator(`plugin.overrun.blockly.getEnemyName.message`),
			args0: [
				{
					'type': 'field_dropdown',
					'name': 'VALUE',
					'options': [['enemy', 'ENEMY'], ['me', 'ME']]
				}
			],
			color: 160,
			tooltip: global.translator(`plugin.overrun.blockly.getEnemyName.tooltip`),
			previousStatement: null,
			nextStatement: null,
			output: 'String'
		}
	]
}];

blockly[0].content = blockly[0].content.concat(['getOverall', 'getCurrent', 'getTurn', 'getYaw', 'getX', 'getY'].map((v) => {
	return {
		conv: v,
		message0: global.translator(`plugin.overrun.blockly.${v}.message`),
		args0: [
			{
				'type': 'field_dropdown',
				'name': 'VALUE',
				'options': [['enemy', 'ENEMY'], ['me', 'ME']]
			}
		],
		color: 160,
		tooltip: global.translator(`plugin.overrun.blockly.${v}.tooltip`),
		previousStatement: null,
		nextStatement: null,
		output: 'Number'
	};
}));

module.exports = blockly;
