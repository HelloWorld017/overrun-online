var api = require('./api-list');
var blockly = require('./blockly-list');
var checkPass = require(global.pluginsrc('common-pass', 'check-pass'))('meiro');
var entry = require(global.pluginsrc('common-entry', 'common-router'));
var MeiroRankedGame = require('./meiro-ranked-game');
var MeiroUnrankedGame = require('./meiro-unranked-game');
var path = require('path');
var UnrankedMatchmaker = require(global.src('matchmake-unranked'));

module.exports = {
	name: 'Meiro',
	author: 'Khinenw',
	version: 'alpha 0.0.0 201604020001',
	onLoad: (cb) => {
		global.server.addToPool(MeiroRankedGame);
		global.server.addToPool(MeiroUnrankedGame, UnrankedMatchmaker);
		cb();
	},
	onServerInit: (app, cb) => {
		app.use('/entry', entry('meiro', 'MEIRO', 'orange'));
		app.use('/render/meiro.js', (req, res) => {
			res.sendFile(global.pluginsrc('meiro', 'meiro-render.js'));
		});
		app.use('/resources/image/pass/meiro.svg', (req, res) => {
			res.sendFile(path.join(global.pluginsrc('meiro', 'image'), 'meiro-pass.svg'));
		});
		app.use('/meiro/teleporter.svg', (req, res) => {
			res.sendFile(path.join(global.pluginsrc('meiro', 'image'), 'meiro-teleporter.svg'));
		});
		app.use('/meiro/trap.svg', (req, res) => {
			res.sendFile(path.join(global.pluginsrc('meiro', 'image'), 'meiro-trap.svg'));
		});
		cb();
	},
	renderHook: {
		'battle': '<script src="/render/meiro.js"></script>\n<script src="/resources/js/tween.js"></script>'
	},
	apiList: [{
		name: 'MEIRO-RANKED',
		content: api
	}, {
		name: 'MEIRO-UNRANKED',
		content: api
	}],
	blockly: blockly,
	entry: [{
		name: global.translator('plugin.meiro'),
		href: '/entry/meiro',
		className: 'orange',
		checkPlayer: checkPass
	}]
};
