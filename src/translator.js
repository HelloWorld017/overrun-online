var translate = (key, options) => {
	var translation = global.translation[key] || key;
	options = options || {};

	Object.keys(options).forEach((k) => {
		translation = translation.split(`%${k}%`).join(options[k]);
	});

	translation = translation.replace(/>([^]+)</g, (match, p1) => {
		return translate(p1, options);
	});

	translation = translation.replace(/>>/g, '>').replace(/<</g, '<');

	return translation;
};

module.exports = translate;
