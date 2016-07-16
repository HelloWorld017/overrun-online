global.loadTranslation({
	name: 'meiro',
	translations: {
		'default': 'ko',
		'ko': global.pluginsrc('meiro', 'translation-ko.json')
	}
});

var fs = require('fs');
var meiroConfig = global.generateAndLoad('meiro-config.json', fs.readFileSync(global.pluginsrc('meiro', 'meiro-config.json'), 'utf8'));

var api = require('./api-list');
var blockly = require('./blockly-list');
var checkPass = require(global.pluginsrc('common-pass', 'check-pass'))('meiro');
var entry = require(global.pluginsrc('common-entry', 'common-router'));
var MeiroRankedGame = require('./meiro-ranked-game');
var MeiroUnrankedGame = require('./meiro-unranked-game');
var MeiroTestGame = require('./meiro-test-game');
var path = require('path');
var translations = JSON.stringify(require('./meiro-game-translation'));
var UnrankedMatchmaker = require(global.src('matchmake-unranked'));
var TestMatchmaker = require(global.src('matchmake-test'));

module.exports = {
	name: 'Meiro',
	author: 'Khinenw',
	version: 'alpha 0.0.0 201604020001',
	onLoad: (cb) => {
		global.server.addToPool(MeiroRankedGame);
		global.server.addToPool(MeiroUnrankedGame, UnrankedMatchmaker);
		global.server.addToPool(MeiroTestGame, TestMatchmaker(global.server, MeiroTestGame, meiroConfig['plugin-meiro-test-arg']), true);
		cb();
	},
	onServerInit: (app, cb) => {
		app.use('/entry', entry('meiro', 'MEIRO', 'orange'));
		app.use('/render/meiro.js', (req, res) => {
			res.sendFile(global.pluginsrc('meiro', 'meiro-render.js'));
		});

		app.use('/render/meiro-test.js', (req, res) => {
			res.sendFile(global.pluginsrc('meiro', 'meiro-test.js'));
		});

		app.use('/render/meiro-translate.js', (req, res) => {
			res.status(200).send('var meiroTranslations = ' + translations + ';');
		});

		app.use('/resources/image/pass/meiro.svg', (req, res) => {
			res.sendFile(path.join(global.pluginsrc('meiro', 'image'), 'meiro-pass.svg'));
		});

		['teleporter', 'trap', 'wallcutter'].forEach((v) => {
			app.use('/meiro/' + v + '.svg', (req, res) => {
				res.sendFile(path.join(global.pluginsrc('meiro', 'image'), 'meiro-' + v + '.svg'));
			});
		});
		cb();
	},
	renderHook: {
		'battle': '<script src="/render/meiro-translate.js"></script>\n<script src="/render/meiro.js"></script>',
		'build': '<script src="/render/meiro-translate.js"></script>\n<script src="/render/meiro.js"></script>\n<script src="/render/meiro-test.js"></script>'
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
