var localeval = require('localeval');

module.exports = (code, context, timeout, cb) => {
	//TODO:10 Docker?
	localeval(code, context, timeout, cb);
};
