var localeval = require('localeval');

module.exports = (code, context, timeout, cb) => {
	//TODO Docker?
	localeval(code, context, timeout, cb);
};
