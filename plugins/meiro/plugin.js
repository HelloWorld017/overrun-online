var blockly = require('./blockly-list');
var checkPass = require(global.pluginsrc('common-pass', 'check-pass'))('meiro');
var entry = require(global.pluginsrc('common-entry', 'common-router'));
var meiro = require('./meiro-game');
var MeiroRankedGame = require('./meiro-ranked-game');
var MeiroUnrankedGame = require('./meiro-unranked-game');
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
		app.use('/entry', entry('meiro', 'MEIRO'));
		app.use('/render/meiro.js', (req, res) => {
			res.sendFile(global.pluginsrc('meiro', 'meiro-render.js'));
		});
		cb();
	},
	renderHook: {
		'battle': '<script src="/render/meiro.js"></script>\n<script src="/resources/js/tween.js"></script>'
	},
	apiList: [{
		name: 'MEIRO-RANKED',
		content: meiro.api.content
	}, {
		name: 'MEIRO-UNRANKED',
		content: meiro.api.content
	}],
	blockly: blockly,
	entry: [{
		name: global.translator('plugin.meiro'),
		href: '/entry/meiro',
		className: 'orange',
		checkPlayer: checkPass
	}]
};
