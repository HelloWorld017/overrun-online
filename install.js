var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;

checkAndGenerate(['server.json', 'translation-en.json', 'translation-ko.json', 'theme.json']);

var config = require('object-merge')(require('./resources/server'), require('./server'));
var url = "mongodb://" + config['db-address'] + ":" + config['db-port'] + "/" + config['db-name'];

MongoClient.connect(url, (err, db) => {
	db.createCollection(config['collection-user']).then(() => {
		return db.createCollection(config['collection-session']);
	}).then(() => {
		return db.createCollection(config['collection-auth']);
	}).then(() => {
		return db.createCollection(config['collection-reset']);
	}).then(() => {
		return db.createCollection(config['collection-battle']);
	}).then(() => {
		return db.collection(config['collection-user']).createIndex({name: 1, point: 1, email: 1, nickname: 1, github: 1});
	}).then(() => {
		return db.collection(config['collection-battle']).createIndex({id: 1, dateTime: -1});
	}).then(() => {
		console.log(chalk.cyan("overrun-online installed successfully!"));
		require('process').exit(0);
	}).catch((err) => {
		console.error(chalk.red("Error while installing overrun-online!"));
		console.error(chalk.red("Reason : " + err.toString()));
		require('process').exit(0);
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
