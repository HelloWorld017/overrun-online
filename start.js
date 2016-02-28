var app = require('../app');
var debug = require('debug')('overrun-online:server');
var http = require('http');

global.games = [];
global.players = [];

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
