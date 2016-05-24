var blockly = require('./blockly-list');
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
	blockly: blockly,
	entry: [{
		name: global.translator('plugin.overrun'),
		href: '/entry/overrun',
		className: 'orange',
		checkPlayer: checkPass
	}],
};
