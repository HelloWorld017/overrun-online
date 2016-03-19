module.exports = (key, options) => {
	var translation = global.translation[key] || key;
	options = options || {};

	Object.keys(options).forEach((k) => {
		translation = translation.split(`%${k}%`).join(options[k]);
	});

	return translation;
};
