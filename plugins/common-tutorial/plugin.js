global.loadTranslation({
	name: 'entry',
	translations: {
		'default': 'ko',
		'ko': global.pluginsrc('common-tutorial', 'translation-ko.json')
	}
});

var express = require('express');
var path = require('path');

module.exports = {
	name: 'Common Tutorial',
	author: 'Khinenw',
	version: 'alpha 1.0.0 201607170001',
	onLoad: (cb) => {
		global.tutorial = global.tutorial.concat(require('./tutorial'));
		cb();
	},
	onServerInit: (app, cb) => {
		app.use(express.static(path.join(__dirname, 'images')));
		cb();
	}
};
