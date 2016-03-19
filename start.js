var debug = require('debug')('overrun-online:server');
var fs = require('fs');
var http = require('http');
var path = require('path');
var objectMerge = require('object-merge');
var MongoClient = require('mongodb').MongoClient;
var Server = require('./src/server');

checkAndGenerate('server.json');
checkAndGenerate('translation.json');
checkAndGenerate('theme.json');

global.config = objectMerge(require('.resources/server'), require('./server'));
global.translation = objectMerge(require('.resources/translation'), require('./translation'));
global.theme = objectMerge(require('.resources/theme'), require('./theme'));
global.translator = require('./src/translator');
global.mongo = undefined;
global.server = undefined;
global.users = undefined;

var url = "mongodb://" + global.config['db-address'] + ":" + global.config['db-port'] + "/" + global.config['db-name'];
MongoClient.connect(url, (err, client) => {
	global.mongo = client;
	global.server = new Server();

	var app = require('./app');
	var port = ((val) => {
		var portNumber = parseInt(val, 10);

	  	if(isNaN(portNumber)){
	      	return val;
	  	}

	  	if(portNumber >= 0){
	  	  return portNumber;
	  	}

	  	return false;
	})(process.env.PORT || '3000');

	app.set('port', port);

	var httpServer = http.createServer(app);
	httpServer.listen(port);
	httpServer.on('error', (err) => {
		if(err.syscall !== 'listen') throw err;
		var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

		switch(err.code){
			case 'EACCES':
				console.error(bind + ' requires elevated priviledges');
				process.exit(1);
				return;

			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				return;
		}

		throw error;
	});
	httpServer.on('listening', () => {
		var addr = server.address();
		debug('Listening on ' + ((typeof addr === 'string') ? 'pipe ' + addr : 'port ' + addr.port));
	});
});

function checkAndGenerate(target){
	try{
		fs.accessSync(path.join('./', target), fs.F_OK);
	}catch(err){
		if(err){
			fs.writeFileSync(path.join('./', target), fs.readFileSync(path.join('./resources', target)));
			console.log(global.translator('server.conf.load', {
				name: target
			}));
		}
	}
}
