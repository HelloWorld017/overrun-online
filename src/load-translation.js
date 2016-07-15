var fs = require('fs');
var objectMerge = require('object-merge');
var path = require('path');

module.exports = (translation) => {
	var name = translation.name;
	var lang = global.config.lang;
	var translations = translation.translations;
	if(translations[lang] !== undefined) lang = translations['default'];

	var fileName = name + '-' + lang;

	try{
		if(fs.accessSync(path.join('./translations', fileName + '.json'), fs.R_OK)){
			console.log(global.translator('server.eperm', {
				file: 'translations/' + fileName + '.json'
			}));
			cb();
			return;
		}
	}catch(e){
		fs.writeFileSync(path.join('./translations', fileName + '.json'), translations[lang]);
		console.log(global.translator('server.create', {
			file: 'translations/' + fileName + '.json'
		}));
	}

	global.translation = objectMerge(
		global.translation,
		objectMerge(JSON.parse(translations[lang]), require('../translations/' + fileName))
	);
};
