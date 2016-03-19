var http = require('http');
var objectMerge = require('object-merge');
var MongoClient = require('mongodb').MongoClient;
var NodeRSA = require('node-rsa');
var Server = require('./src/server');

global.config = objectMerge(require('./resources/server'), require('./server'));
global.translation = objectMerge(require('./resources/translation'), require('./translation'));
global.theme = objectMerge(require('./resources/theme'), require('./theme'));
global.translator = require('./src/translator');
global.key = (process.env.NODE_ENV || 'development') === 'development' ? new NodeRSA({b: 512}) : new NodeRSA({b: 4096});
global.mongo = undefined;
global.server = undefined;
global.users = {};

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
		var addr = httpServer.address();
		console.log('Listening on ' + ((typeof addr === 'string') ? 'pipe ' + addr : 'port ' + addr.port));
	});
});
