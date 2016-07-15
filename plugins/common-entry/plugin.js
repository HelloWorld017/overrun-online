var fs = require('fs');
global.loadTranslation({
	name: 'entry',
	translations: {
		'default': 'ko',
		'ko': fs.readFileSync(global.pluginsrc('common-entry', 'translation-ko.json'), 'utf8')
	}
});

module.exports = {
	name: 'Common Entry',
	author: 'Khinenw',
	version: 'alpha 0.0.0 201604240001'
};
