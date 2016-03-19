var fs = require('fs');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;

checkAndGenerate(['server.json', 'translation-en.json', 'translation-ko.json', 'theme.json']);

var config = require('object-merge')(require('./resources/server'), require('./server'));
var url = "mongodb://" + config['db-address'] + ":" + config['db-port'] + "/" + config['db-name'];

MongoClient.connect(url, (err, db) => {
	db.createCollection(config['collection-user']).then(() => {
		db.createCollection(config['collection-session']).then(() => {
			db.createCollection(config['collection-auth']).then(() => {
				db.createCollection(config['collection-reset']).then(() => {
					console.log("overrun-online installed successfully!");
					require('process').exit(0);
				});
			});
		});
	});
});

function checkAndGenerate(targets){
	targets.forEach((target) => {
		try{
			fs.accessSync(path.join('./', target), fs.F_OK);
		}catch(err){
			if(err){
				fs.writeFileSync(path.join('./', target), fs.readFileSync(path.join('./resources', target)));
				console.log(`Created configuration file: ${target}`);
			}
		}
	});
}
