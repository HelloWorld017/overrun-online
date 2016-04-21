var path = require('path');
var process = require('process');
const SOURCE_DIR = path.join(process.cwd(), 'src');

module.exports = (source) => {
	return path.join(SOURCE_DIR, source);
};
