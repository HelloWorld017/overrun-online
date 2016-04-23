var entry = require('./overrun-router');
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
		app.use('/entry', entry);
		cb();
	},
	apiList: [{
		name: 'OVERRUN-RANKED',
		content: overrun.api.content
	}, {
		name: 'OVERRUN-UNRANKED',
		content: overrun.api.content
	}],
	entry: [{
		name: global.translator('plugin.overrun'),
		href: '/entry/overrun',
		className: 'orange'
	}],
};