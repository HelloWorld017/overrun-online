//source from localeval by espadrine
//license: cc-by-3.0
var child;
var startChild = function startChild() {
	var cp = require('child_process');
	child = cp.fork(__dirname + '/child.js');
};

var evaluator = function(code, sandbox, timeout, cb) {
	if (child == null) {
	  startChild();
	}
	var th = setTimeout(function() {
		child.kill('SIGKILL');
		if (cb) {
			cb(new Error('The script took more than ' + timeout + 'ms. Abort.'));
		}
		startChild();
	}, timeout);
	child.once('message', function(m) {
		clearTimeout(th);
		if (cb) {
			if (m.error) {
				console.log(JSON.stringify(m.error));
				cb(m.error);
			} else cb(null, m.result);
		}
	});
	child.send({ code: code, sandbox: sandbox });
};

evaluator.clear = function() {
	child.kill('SIGKILL');
};

module.exports = evaluator;
