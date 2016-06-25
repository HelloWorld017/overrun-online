module.exports = {
	name: 'Common Blockly',
	author: 'Khinenw',
	version: 'alpha 0.0.0 201606250001',
	blockly: [
		{
			name: 'JSON',
			content: [
				{
					conv: 'JSON.parse',
					message0: global.translator(`plugin.json.parse.message`),
					args0: [
						{
							type: 'input_value',
							name: 'VALUE',
							check: 'String'
						}
					],
					colour: 60,
					tooltip: global.translator(`plugin.json.parse.tooltip`),
					output: null
				},
				{
					conv: 'JSON.stringify',
					message0: global.translator(`plugin.json.stringify.message`),
					args0: [
						{
							type: 'input_value',
							name: 'VALUE',
							check: null
						}
					],
					colour: 60,
					tooltip: global.translator(`plugin.json.stringify.tooltip`),
					output: 'String'
				}
			]
		},
		{
			name: 'Types',
			content: [
				{
					conv: 'parseInt',
					message0: global.translator('plugin.type.parseInt.message'),
					args0: [
						{
							type: 'input_value',
							name: 'VALUE',
							check: 'String'
						}
					],
					colour: 240,
					tooltip: global.translator('plugin.type.parseInt.tooltip'),
					output: 'Number'
				},
				{
					conv: 'toString',
					convManual: `return ['(' + (Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_MEMBER) || '') + ').toString()', Blockly.JavaScript.ORDER_FUNCTION_CALL];`,
					message0: global.translator('plugin.type.toString.message'),
					args0: [
						{
							type: 'input_value',
							name: 'VALUE',
							check: 'Number'
						}
					],
					colour: 240,
					tooltip: global.translator('plugin.type.toString.tooltip'),
					output: 'String'
				}
			]
		}
	]
};
