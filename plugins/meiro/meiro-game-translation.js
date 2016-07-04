var translationList = [
	'max.exceed',
	'content.not.string',
	'log.too.long',
	'cannot.move',
	'move.over.wall',
	'carve.fail',
	'already.checked',
	'save.not.string',
	'save.too.long'
].map((v) => 'turn.' + v);

var translations = {};

translationList.forEach((v) => {
	translations[v] = global.translator('plugin.meiro.' + v);
});

module.exports = translations;
