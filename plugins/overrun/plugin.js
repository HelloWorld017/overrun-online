var checkPass = require(global.pluginsrc('common-pass', 'check-pass'))('overrun');
var entry = require(global.pluginsrc('common-entry', 'common-router'));
var overrun = require('./overrun-game');
var OverrunRankedGame = require('./overrun-ranked-game');
var OverrunUnrankedGame = require('./overrun-unranked-game');
var UnrankedMatchmaker = require(global.src('matchmake-unranked'));

module.exports = {
	name: 'Overrun',
	author: 'Khinenw',
	version: 'alpha 0.0.0 201604020001',
	onLoad: (cb) => {
		global.server.addToPool(OverrunRankedGame);
		global.server.addToPool(OverrunUnrankedGame, UnrankedMatchmaker);
		cb();
	},
	onServerInit: (app, cb) => {
		app.use('/entry', entry('overrun', 'OVERRUN'));
		cb();
	},
	apiList: [{
		name: 'OVERRUN-RANKED',
		content: overrun.api.content
	}, {
		name: 'OVERRUN-UNRANKED',
		content: overrun.api.content
	}],
	blockly: [{
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
				conv: 'getOverall',
				message0: global.translator('plugin.overrun.blockly.getOverall.message'),
				args0: [
					{
						'type': 'field_dropdown',
						'name': 'VALUE',
						'options': [['enemy', 'ENEMY'], ['me', 'ME']]
					}
				],
				color: 160,
				tooltip: global.translator('plugin.overrun.blockly.getOverall.tooltip'),
				previousStatement: null,
				nextStatement: null
			}
		]
	}],
	entry: [{
		name: global.translator('plugin.overrun'),
		href: '/entry/overrun',
		className: 'orange',
		checkPlayer: checkPass
	}],
};
