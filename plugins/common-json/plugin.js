module.exports = {
	name: 'Common JSON',
	author: 'Khinenw',
	version: 'alpha 0.0.0 201606250001',
	blockly: [{
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
				color: 160,
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
				color: 160,
				tooltip: global.translator(`plugin.json.stringify.tooltip`),
				output: 'String'
			}
		]
	}]
};
