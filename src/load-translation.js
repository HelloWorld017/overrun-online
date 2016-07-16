var fs = require('fs');
var objectMerge = require('object-merge');
var path = require('path');
var translationList = {};

var TranslateLoad = (translation) => {
	translationList[translation.name] = (translation);
	var name = translation.name;
	var lang = global.config.lang;
	var translations = translation.translations;
	if(translations[lang] !== undefined) lang = translations['default'];

	var fileName = name + '-' + lang;
	var fileContent = fs.readFileSync(translations[lang], 'utf8');

	try{
		if(fs.accessSync(path.join('./translations', fileName + '.json'), fs.R_OK)){
			console.log(global.translator('server.eperm', {
				file: 'translations/' + fileName + '.json'
			}));
			cb();
			return;
		}
	}catch(e){
		fs.writeFileSync(path.join('./translations', fileName + '.json'), fileContent);
		console.log(global.translator('server.create', {
			file: 'translations/' + fileName + '.json'
		}));
	}

	global.translation = objectMerge(
		global.translation,
		objectMerge(JSON.parse(fileContent), require('../translations/' + fileName))
	);
};

TranslateLoad.reload = () => {
	Object.keys(translationList).map((k) => translationList[k]).forEach((v) => {
		var fileName = v.name + '-' + global.config.lang;
		delete require.cache[require.resolve('../translations/' + fileName)];
		TranslateLoad(v);
	});
};

module.exports = TranslateLoad;
