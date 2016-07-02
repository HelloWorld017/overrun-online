//source from localeval by espadrine
//license: cc-by-3.0
var cp = require('child_process');
var child = undefined;

var evaluator = (code, sandbox, timeout, cb) => {
	if(child === undefined) child = cp.fork(__dirname + '/child.js');
	var processed = false;

	child.once('message', (message) => {
		processed = true;
		if(message.error){
			cb(message.error);
		}else{
			cb(null, message.result);
		}
	});

	child.send({code: code, sandbox: sandbox});

	setTimeout(() => {
		try{
			if(!processed){
				child.kill('SIGKILL');
				child = cp.fork(__dirname +'/child.js');
				cb("Timeout!");
				return;
			}
		}catch(e){}
	}, timeout);
};

module.exports = evaluator;
