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
					convManual: `return ['(' + (Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC) || '') + ').toString()', Blockly.JavaScript.ORDER_FUNCTION_CALL];`,
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
		},
		{
			name: 'Objects',
			content: [
				{
					conv: 'get',
					convManual: `
						var obj = Blockly.JavaScript.valueToCode(block, 'OBJECT', Blockly.JavaScript.ORDER_MEMBER) || '{}';
						var code = obj + '[' + (Blockly.JavaScript.valueToCode(block, 'INDEX', Blockly.JavaScript.ORDER_ATOMIC) || '') + ']';
						return [code, Blockly.JavaScript.ORDER_MEMBER];
					`,
					message0: global.translator('plugin.object.get.message'),
					args0: [
						{
							type: 'input_value',
							name: 'OBJECT',
							check: 'Object'
						},
						{
							type: 'input_value',
							name: 'INDEX',
							check: 'String'
						}
					],
					colour: 330,
					tooltip: global.translator('plugin.object.get.tooltip'),
					output: null
				},

				{
					conv: 'set',
					convManual: `
						var obj = Blockly.JavaScript.valueToCode(block, 'OBJECT', Blockly.JavaScript.ORDER_MEMBER) || '{}';
						var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT);
						var index = Blockly.JavaScript.valueToCode(block, 'INDEX', Blockly.JavaScript.ORDER_ATOMIC);
						return obj + '[' + index + '] = ' + value + ';\\n';
					`,
					message0: global.translator('plugin.object.set.message'),
					args0: [
						{
							type: 'input_value',
							name: 'OBJECT',
							check: 'Object'
						},
						{
							type: 'input_value',
							name: 'INDEX',
							check: 'String'
						},
						{
							type: 'input_value',
							name: 'VALUE',
							check: null
						}
					],
					colour: 330,
					tooltip: global.translator('plugin.object.set.tooltip'),
					nextStatement: null,
					previousStatement: null
				},

				{
					conv: 'newObject',
					convManual: `
						return ['{}', Blockly.JavaScript.ORDER_ATOMIC];
					`,
					message0: global.translator('plugin.object.newObject.message'),
					colour: 330,
					tooltip: global.translator('plugin.object.newObject.tooltip'),
					output: 'Object'
				}
			]
		}
	]
};
