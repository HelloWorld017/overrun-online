var async = require('async');
var chalk = require('chalk');
var fs = require('fs');
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var NodeRSA = require('node-rsa');
var objectMerge = require('object-merge');
var path = require('path');
var requireSource = require('./src/require-source');
var rl = require('readline').createInterface(process.stdin, process.stdout);
var Server = require('./src/server');
var sharedsession = require("express-socket.io-session");

const SERVER_VERSION = "alpha 1.0.0 1607170001";
const SERVER_VERSION_CODE = "$2Lime Sidewinder$";
const SERVER_VERSION_CODE_UNICODE = "$2ライム ヨコバイガラガラヘビ$";

rl.setPrompt('>>');

global.config = objectMerge(require('./resources/server'), require('./server'));
global.translation = objectMerge(require('./resources/translation-' + global.config.lang), require('./translation-' + global.config.lang));
global.theme = objectMerge(require('./resources/theme'), require('./theme'));
global.translator = require('./src/translator');
global.tutorial = [];
global.loadTranslation = require('./src/load-translation');
global.key = (process.env.NODE_ENV || 'development') === 'development' ? new NodeRSA({b: 512}, {encryptionScheme: 'pkcs1'}) : new NodeRSA({b: 4096}, {encryptionScheme: 'pkcs1'});
global.mongo = undefined;
global.server = undefined;
global.skin = function(skin){
	return (((global.config['shop-items'].skins[skin] || {}).icon) || ('/resources/image/skins/' + skin));
};

global.generateAndLoad = (target, defaultContent) => {
	try{
		fs.accessSync(path.join('./', target), fs.F_OK);
	}catch(err){
		if(err){
			fs.writeFileSync(path.join('./', target), defaultContent);
			console.log(global.translator('server.create', {
				file: path.join('./', target)
			}));
		}
	}

	return require('./' + target);
};

global.src = requireSource.src;
global.pluginsrc = requireSource.plugin;
global.version = SERVER_VERSION;
global.users = {};

global.headerHook = {};
global.plugins = {};
global.entryList = [];
global.apiList = {};
global.blockly = [];

global.cmd = {
	'translation': () => {
		delete require.cache[require.resolve('./translation-' + global.config.lang)];
		delete require.cache[require.resolve('./resources/translation-' + global.config.lang)];

		global.translation = objectMerge(require('./resources/translation-' + global.config.lang), require('./translation-' + global.config.lang));
		global.loadTranslation.reload();
		console.log(global.translator('command.translation'));
	},
	'debug': () => {
		debugger;
	},
	'exit': () => {
		process.exit(0);
	},
	'help': () => {
		console.log(chalk.cyan(Object.keys(global.cmd).sort().join('\n')));
	},
	'auth': (input) => {
		var username = input.split(' ').filter((v, k) => {
			return k !== 0;
		}).join(' ');

		if(username === ''){
			console.log(global.translator('usage.auth'));
			return;
		}

		global.mongo
			.collection(global.config['collection-user'])
			.find({name: username})
			.toArray((err, res) => {
				if(err){
					console.log(chalk.red(global.translator('error.internalserver')));
					return;
				}

				if(res.length <= 0){
					console.log(chalk.red(global.translator('error.nosuchuser')));
					return;
				}

				global.mongo
					.collection(global.config['collection-user'])
					.findOneAndUpdate({name: username}, {
						$set: {
							emailVerified: true
						}
					}).then(() => {
						console.log(chalk.cyan(global.translator('authenticate.finish.masthead')));
					});
			});
	}
};

rl.on('line', (input) => {
	var cmd = input.split(' ')[0];
	if(global.cmd[cmd] !== undefined) global.cmd[cmd](input);
	else console.log(global.translator('command.unknown', {
		command: cmd
	}));
});

console.log(global.translator('server.load', {
	version: SERVER_VERSION,
	codeAscii: SERVER_VERSION_CODE,
	codeUnicode: SERVER_VERSION_CODE_UNICODE
}));

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
			console.error(chalk.red(err.toString()));
			process.exit(1);
			return;
		}

		async.eachSeries(files, (v, cb) => {
			fs.stat(path.join(__dirname, 'plugins', v), (err, stats) => {
				if(err){
					console.error(global.translator('server.plugin.error'));
					console.error(err.toString());
					cb();
					return;
				}

				if(!stats.isDirectory()){
					cb();
					return;
				}

				fs.access(path.join(__dirname, 'plugins', v, 'plugin.js'), fs.R_OK, (err) => {
					if(err){
						cb();
						return;
					}

					var plugin = require(path.join(__dirname, 'plugins', v, 'plugin.js'));
					global.plugins[plugin.name] = plugin;

					if(plugin.renderHook){
						Object.keys(plugin.renderHook).forEach((header) => {
							if(!global.headerHook[header]) global.headerHook[header] = [];

							global.headerHook[header].push(plugin.renderHook[header]);
						});
					}

					if(plugin.entry){
						global.entryList = global.entryList.concat(plugin.entry);
					}

					if(plugin.apiList){
						plugin.apiList.forEach((v) => {
							global.apiList[v.name] = v.content;
						});
					}

					if(plugin.blockly){
						global.blockly = global.blockly.concat(plugin.blockly);
					}

					var loadCallback = () => {
						console.log(global.translator('server.plugin.load', {
							name: plugin.name,
							author: plugin.author,
							version: plugin.version
						}));
						cb();
					};

					if(plugin.onLoad){
						plugin.onLoad(loadCallback);
					}else loadCallback();
				});
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
					console.log((typeof addr === 'string') ? global.translator('server.http.pipe', {addr: addr}) : global.translator('server.http.port', {port: addr.port}));
				});

				var io = require('socket.io')(httpServer);
				io.use(sharedsession(global.session));

				io.on('connection', (socket) => {
					socket.on('join room', (data) => {
						if(typeof data !== 'string') return;
						data = data.replace(/[^a-zA-Z0-9-_:.]/g, '');

						if(socket.room !== undefined){
							socket.leave(socket.room);
						}

						socket.room = data;
						socket.join(data);
					});

					socket.on('chat', (data) => {
						if(socket.room === undefined) return;
						if(typeof data !== 'string') return;

						var user = (global.users[socket.handshake.session.userid]);
						if(user && (socket.handshake.session.token !== user.token)) user = undefined;
						if(user && user.unregistered) user = undefined;

						if(user === undefined) return;

						io.sockets.in(socket.room).emit('text', {
							user: user.getName(),
							nickname: user.nickname,
							emailhash: user.getHashedEmail(),
							content: data
						});
					});
				});
			});
		});
	});
});
