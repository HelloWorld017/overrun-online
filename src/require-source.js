var path = require('path');
var process = require('process');

const SOURCE_DIR = path.join(process.cwd(), 'src');
const PLUGIN_DIR = path.join(process.cwd(), 'plugin');

module.exports = {
	src: (source) => {
		return path.join(SOURCE_DIR, source);
	},

	plugin: (pluginName, source) => {
		return path.join(PLUGIN_DIR, pluginName, source);
	}
};
