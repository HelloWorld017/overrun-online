var async = require('async');
var fs = require('fs');
var http = require('http');
var path = require('path');
var objectMerge = require('object-merge');
var MongoClient = require('mongodb').MongoClient;
var NodeRSA = require('node-rsa');
var Server = require('./src/server');

const SERVER_VERSION = "alpha 0.0.0 1603260001";

global.config = objectMerge(require('./resources/server'), require('./server'));
global.translation = objectMerge(require('./resources/translation-' + global.config.lang), require('./translation-' + global.config.lang));
global.theme = objectMerge(require('./resources/theme'), require('./theme'));
global.translator = require('./src/translator');
global.key = (process.env.NODE_ENV || 'development') === 'development' ? new NodeRSA({b: 512}, {encryptionScheme: 'pkcs1'}) : new NodeRSA({b: 4096});
global.mongo = undefined;
global.server = undefined;
global.version = SERVER_VERSION;
global.users = {};

global.ejsHook = {};
global.plugins = {};
global.entryList = {};
global.apiList = {};

var url = "mongodb://" + global.config['db-address'] + ":" + global.config['db-port'] + "/" + global.config['db-name'];
MongoClient.connect(url, (err, client) => {
	global.mongo = client;
	global.server = new Server();

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
	fs.readdir('./plugins/', (err, files) => {
		if(err){
			console.error(global.translator('server.plugin.error'));
			console.error(err.toString());
			process.exit(1);
			return;
		}

		async.eachSeries(files, (v, cb) => {
			var plugin = require(path.join(__dirname, 'plugins', v));

			if(!plugin.onLoad){
				cb();
				return;
			}

			global.plugins[plugin.name] = plugin;

			if(plugin.renderHook){
				Object.keys(plugin.renderHook).forEach((ejs) => {
					if(!ejsHook[ejs]) ejsHook[ejs] = [];

					ejsHook[ejs].push(plugin.renderHook[ejs]);
				});
			}

			if(plugin.entry){
				global.entryList = global.entryList.concat(plugin.entry);
			}

			if(plugin.apiList){
				global.apiList[plugin.name] = plugin.apiList;
			}

			plugin.onLoad(() => {
				cb();
				console.log(global.translator('server.plugin.load', {
					name: plugin.name,
					author: plugin.author,
					version: plugin.version
				}));
			});
		}, () => {
			var app = require('./app')((app) => {
				app.set('port', port);

				var httpServer = http.createServer(app);
				httpServer.listen(port);
				httpServer.on('error', (err) => {
					if(err.syscall !== 'listen') throw err;
					var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

					switch(err.code){
						case 'EACCES':
							console.error(global.translator('server.http.eacces', {
								bind: bind
							}));
							process.exit(1);
							return;

						case 'EADDRINUSE':
							console.error(global.translator('server.http.eaddrinuse'));
							process.exit(1);
							return;
					}

					throw error;
				});

				httpServer.on('listening', () => {
					var addr = httpServer.address();
					console.log(global.translator('server.listen', {
						port: (typeof addr === 'string') ? 'pipe ' + addr : 'port ' + addr.port
					}));
				});

			});
		});
	});
});
