var errors = require('../src/errors');
var express = require('express');
var router = express.Router();
var Player = require('../src/player');

var ServerError = errors.ServerError;
var InvalidDataError = errors.InvalidDataError;


router.get('/:user', (req, res, next) => {
	global.mongo
		.collection(global.config['collection-user'])
		.find({name: req.params.user})
		.toArray((err, arr) => {
			if(err){
				next(new ServerError());
				return;
			}

			if(arr.length <= 0){
				next(new InvalidDataError());
				return;
			}

			res.render('user', {
				user: new Player(arr[0])
			});
		});
});

router.get('/:user/:type/:href/bots', (req, res, next) => {
	global.mongo
		.collection(global.config['collection-user'])
		.find({name: req.params.user})
		.toArray((err, arr) => {
			if(err){
				next(new ServerError());
				return;
			}

			if(arr.length <= 0){
				next(new InvalidDataError());
				return;
			}

			var check = req.params.type.split(',').every((t) => {
				if(global.server.gamePool[t] === undefined){
					return false;
				}

				return true;
			});

			if(!check){
				next(new InvalidDataError());
				return;
			}

			try{
				var href = new Buffer(req.params.href, 'base64').toString();
				res.render('user/bot-list', {
					bots: arr[0].bots,
					type: req.params.type.split(','),
					href: href
				});
			}catch(e){
				next(new InvalidDataError());
				return;
			}
		});
});

module.exports = router;
